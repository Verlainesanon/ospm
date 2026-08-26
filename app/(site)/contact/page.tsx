import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { Eyebrow, Section, Repere } from "@/components/ui";
import { Reveal, Lettres, Magnetique } from "@/components/anim";
import { FormulaireContact } from "./formulaire";

export const metadata = { title: "Contact" };

export default async function Contact() {
  const r = await getReglages();
  const wa1 = reglage(r, "contact.whatsapp1");
  const wa2 = reglage(r, "contact.whatsapp2");

  const reseaux = [
    ["Facebook", reglage(r, "social.facebook")],
    ["Instagram", reglage(r, "social.instagram")],
    ["TikTok", reglage(r, "social.tiktok")],
    ["Twitter / X", reglage(r, "social.twitter")],
  ].filter(([, url]) => url);

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <Reveal effet="fondu">
            <Eyebrow>Nous joindre</Eyebrow>
          </Reveal>
          <h1 className="mt-6 text-affiche">
            <Lettres texte="60, Rue" depart={130} pas={38} />
            <br />
            <Lettres texte="Dessalines" depart={430} pas={38} className="italic text-encre" />
          </h1>
          <p className="mt-4 text-plomb">
            Passez au comptoir, ecrivez sur WhatsApp, ou laissez un message ici.
          </p>

          <Reveal
            effet="monte"
            delai={200}
            as="dl"
            className="mt-10 divide-y divide-plomb-noir/[0.08] border-y border-plomb-noir/[0.08]"
          >
            {[
              ["Adresse", reglage(r, "contact.adresse")],
              ["Horaires", reglage(r, "contact.horaires")],
              ["WhatsApp", `${wa1}   ${wa2}`],
              ["E-mail", reglage(r, "contact.email")],
              ["Reseaux", "@company.ospm"],
            ].map(([label, valeur]) => (
              <div key={label} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                <dt className="text-micro text-plomb">{label}</dt>
                <dd className="text-sm text-plomb-noir">{valeur}</dd>
              </div>
            ))}
          </Reveal>

          <Reveal effet="monte" delai={320} className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${numeroWhatsapp(wa1)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-rouge"
            >
              WhatsApp {wa1}
            </a>
            <a href={`mailto:${reglage(r, "contact.email")}`} className="btn-contour">
              Ecrire un e-mail
            </a>
          </Reveal>

          {reseaux.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Repere />
              {reseaux.map(([nom, url]) => (
                <a
                  key={nom}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-micro text-plomb-noir hover:text-rouge"
                >
                  {nom}
                </a>
              ))}
            </div>
          )}
        </div>

        <Reveal effet="cote-droit" delai={140}>
          <FormulaireContact />
        </Reveal>
      </div>
    </Section>
  );
}
