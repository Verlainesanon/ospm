import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// L'agent local s'authentifie avec un jeton partage. Sans jeton configure sur
// le serveur, l'API reste fermee.
function agentAutorise(request: Request): boolean {
  const attendu = process.env.OSPM_AGENT_TOKEN;
  if (!attendu) return false;

  const entete = request.headers.get("authorization") ?? "";
  const fourni = entete.startsWith("Bearer ") ? entete.slice(7) : "";
  return fourni.length === attendu.length && fourni === attendu;
}

// GET : les travaux en attente pour les imprimantes thermiques actives.
export async function GET(request: Request) {
  if (!agentAutorise(request)) {
    return NextResponse.json({ erreur: "Jeton invalide." }, { status: 401 });
  }

  const jobs = await prisma.printJob.findMany({
    where: { statut: "EN_ATTENTE", printer: { transport: "ESCPOS", actif: true } },
    orderBy: { createdAt: "asc" },
    take: 20,
    include: { printer: true },
  });

  return NextResponse.json({
    jobs: jobs.map((j) => ({
      id: j.id,
      titre: j.titre,
      texte: j.rendu,
      copies: j.copies,
      imprimante: { nom: j.printer?.nom, cible: j.printer?.cible, largeurMm: j.printer?.largeurMm },
    })),
  });
}

// POST : l'agent renvoie le resultat de chaque travail.
export async function POST(request: Request) {
  if (!agentAutorise(request)) {
    return NextResponse.json({ erreur: "Jeton invalide." }, { status: 401 });
  }

  const corps = (await request.json()) as { id?: string; ok?: boolean; erreur?: string };
  if (!corps.id) {
    return NextResponse.json({ erreur: "Identifiant manquant." }, { status: 400 });
  }

  await prisma.printJob.update({
    where: { id: corps.id },
    data: corps.ok
      ? { statut: "IMPRIME", imprimeLe: new Date(), erreur: null }
      : { statut: "ERREUR", erreur: corps.erreur?.slice(0, 300) ?? "Echec d'impression" },
  });

  return NextResponse.json({ ok: true });
}
