import { prisma } from "@/lib/db";
import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { Eyebrow, Section, BonDeTravail } from "@/components/ui";
import { Reveal, Lettres } from "@/components/anim";
import { FormulaireDevis } from "./formulaire";

export const metadata = { title: "Demander un devis" };

export default async function Devis({
  searchParams,
}: {
  searchParams: { service?: string };
}) {
  const [services, r] = await Promise.all([
    prisma.service.findMany({
      where: { visible: true },
      orderBy: [{ categorie: { ordre: "asc" } }, { ordre: "asc" }],
      select: { slug: true, nom: true, categorie: { select: { nom: true } } },
    }),
    getReglages(),
  ]);

  const wa = numeroWhatsapp(reglage(r, "contact.whatsapp1", "+50942712891"));

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <Reveal effet="fondu">
            <Eyebrow>Devis gratuit</Eyebrow>
          </Reveal>
          <h1 className="mt-6 text-affiche">
            <Lettres texte="Dites-nous ce" depart={120} pas={26} />
            <br />
            <Lettres texte="qu'il faut imprimer" depart={420} pas={26} />
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
