import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE = "ospm_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-local-a-remplacer-en-production",
);

export type Session = { userId: string; nom: string; role: Role };

export const ROLES = ["ADMIN", "GESTIONNAIRE", "CAISSIER", "TECHNICIEN"] as const;
export type Role = (typeof ROLES)[number];

// Qui a le droit de faire quoi. ADMIN a tout par construction.
const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*"],
  GESTIONNAIRE: [
    "contenu",
    "commandes",
    "devis",
    "clients",
    "finance",
    "stock",
    "materiel",
    "impression",
    "rapports",
  ],
  CAISSIER: ["commandes", "devis", "clients", "finance", "impression"],
  TECHNICIEN: ["commandes", "stock", "materiel", "impression"],
};

export function can(role: Role, zone: string): boolean {
  const allowed = PERMISSIONS[role] ?? [];
  return allowed.includes("*") || allowed.includes(zone);
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession(): void {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  // Une base injoignable n'est pas un identifiant invalide : dire « base
  // indisponible » evite de chercher une faute de frappe pendant une panne.
  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  } catch (e) {
    console.error("Connexion impossible — base injoignable:", e);
    return {
      ok: false,
      erreur: "Base de donnees injoignable. Reessayez dans un instant.",
    };
  }

  if (!user || !user.actif) return { ok: false, erreur: "Identifiants invalides." };
  if (!verifyPassword(password, user.password)) {
    return { ok: false, erreur: "Identifiants invalides." };
  }
  await createSession({ userId: user.id, nom: user.nom, role: user.role as Role });
  return { ok: true };
}
