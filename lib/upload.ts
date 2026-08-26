import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const DOSSIER = path.join(process.cwd(), "public", "uploads");
const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo
const TYPES_AUTORISES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/postscript", // .ai, .eps
];

export type FichierEnregistre = { url: string; nom: string; mime: string; taille: number };

export async function enregistrerFichier(fichier: File): Promise<FichierEnregistre> {
  if (fichier.size > TAILLE_MAX) {
    throw new Error(`${fichier.name} depasse 10 Mo.`);
  }
  if (fichier.type && !TYPES_AUTORISES.includes(fichier.type)) {
    throw new Error(`Type de fichier non accepte : ${fichier.type}`);
  }

  await mkdir(DOSSIER, { recursive: true });
  const extension = path.extname(fichier.name).toLowerCase().slice(0, 8);
  const nomDisque = `${randomUUID()}${extension}`;
  const octets = Buffer.from(await fichier.arrayBuffer());
  await writeFile(path.join(DOSSIER, nomDisque), octets);

  return {
    url: `/uploads/${nomDisque}`,
    nom: fichier.name,
    mime: fichier.type,
    taille: fichier.size,
  };
}
