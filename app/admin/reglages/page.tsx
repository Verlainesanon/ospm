import { prisma } from "@/lib/db";
import { TitrePage } from "@/components/admin";
import { FormulaireReglages } from "./formulaire";

export const metadata = { title: "Reglages du site" };

export default async function Reglages() {
  const champs = await prisma.siteSetting.findMany({
    orderBy: [{ groupe: "asc" }, { ordre: "asc" }, { key: "asc" }],
  });

  return (
    <>
      <TitrePage
        titre="Reglages du site"
        sousTitre="Tout ce qui s'affiche sur le site public : coordonnees, textes d'accueil, reseaux, parametres de facturation."
      />
      <FormulaireReglages
        champs={champs.map((c) => ({
          key: c.key,
          value: c.value,
          label: c.label,
          type: c.type,
          groupe: c.groupe,
        }))}
      />
    </>
  );
}
