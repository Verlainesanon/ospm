import { prisma } from "@/lib/db";
import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { Section, BonDeTravail } from "@/components/ui";
import { Reveal } from "@/components/anim";
import { TitrePresse } from "@/components/titre-presse";
import { LigneCommande } from "@/components/ligne-commande";
import { FormulaireDevis } from "./formulaire";

export const metadata = { title: "Demander un devis" };

export default async function Devis({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  // Le formulaire doit rester joignable meme si la liste des services ne
  // charge pas : c'est la page qui rapporte les commandes.
  let services: { slug: string; nom: string; categorie: { nom: string } }[] = [];
  try {
    services = await prisma.service.findMany({
      where: { visible: true },
      orderBy: [{ categorie: { ordre: "asc" } }, { ordre: "asc" }],
      select: { slug: true, nom: true, categorie: { select: { nom: true } } },
    });
  } catch (e) {
    console.error("Erreur chargement services devis:", e);
  }
  const r = await getReglages();

  const wa = numeroWhatsapp(reglage(r, "contact.whatsapp1", "+50942712891"));

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <Reveal effet="fondu">
            <LigneCommande texte="devis --nouveau" vitesse={42} delai={200} />
          </Reveal>
          <h1 className="mt-7 text-enseigne">
            <TitrePresse texte="Dites-nous ce" depart={120} pas={26} />
            <br />
            <TitrePresse texte="qu'il faut imprimer" depart={420} pas={26} />
          </h1>
          <p className="mt-6 max-w-xl text-plomb">
            Plus la description est precise, plus le prix qu'on vous donne est juste. Joignez
            vos fichiers si vous en avez deja.
          </p>

          <Reveal effet="monte" delai={220} className="mt-10">
            <FormulaireDevis
              services={services.map((s) => ({
                slug: s.slug,
                nom: s.nom,
                categorie: s.categorie.nom,
              }))}
              serviceParDefaut={searchParams.service}
            />
          </Reveal>
        </div>

        <Reveal effet="cote-droit" delai={160} as="aside" className="space-y-6 lg:sticky lg:top-28">
          <BonDeTravail
            reference="Comment ca marche"
            lignes={[
              { label: "Reponse", valeur: "Sous 24 heures ouvrables" },
              { label: "Devis", valeur: "Gratuit, sans engagement" },
              { label: "Fichiers", valeur: "JPG, PNG, PDF, AI, EPS" },
              { label: "Acompte", valeur: "50 % a la commande" },
            ]}
          />

          <div className="plaque p-5">
            <p className="text-micro text-plomb">Plus rapide</p>
            <p className="mt-2 text-sm text-plomb-noir">
              Envoyez directement la photo de votre modele sur WhatsApp.
            </p>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="btn-rouge mt-4 w-full"
            >
              {reglage(r, "contact.whatsapp1")}
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
