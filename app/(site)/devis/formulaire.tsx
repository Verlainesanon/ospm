"use client";

import { useFormState, useFormStatus } from "react-dom";
import { envoyerDevis, type EtatDevis } from "./actions";
import { VoileEnvoi } from "@/components/loader";

const initial: EtatDevis = { ok: false, message: "" };

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-encre disabled:opacity-60">
      {pending ? "Envoi en cours" : "Envoyer la demande"}
    </button>
  );
}

// Rendu dans le formulaire pour avoir acces a useFormStatus.
function VoilePendantEnvoi() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <VoileEnvoi titre="Envoi de votre demande" />;
}

export function FormulaireDevis({
  services,
  serviceParDefaut,
}: {
  services: { slug: string; nom: string; categorie: string }[];
  serviceParDefaut?: string;
}) {
  const [etat, action] = useFormState(envoyerDevis, initial);

  if (etat.ok) {
    return (
      <div className="plaque p-8">
        <p className="text-micro font-medium text-rouge">Demande {etat.numero}</p>
        <h2 className="mt-4 text-titre">
          C'est parti a l'atelier
        </h2>
        <p className="mt-3 text-plomb">{etat.message}</p>
        <p className="mt-6 text-micro text-plomb">
          Gardez le numero {etat.numero} : il suit votre travail jusqu'au retrait.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="plaque relative space-y-5 p-7">
      <VoilePendantEnvoi />

      {etat.message && (
        <p className="rounded-plaque border border-rouge/30 bg-rouge/5 px-4 py-3 text-sm text-rouge-sombre">
          {etat.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="etiquette" htmlFor="nomContact">
            Votre nom
          </label>
          <input id="nomContact" name="nomContact" className="champ" required />
        </div>
        <div>
          <label className="etiquette" htmlFor="telephone">
            Telephone / WhatsApp
          </label>
          <input id="telephone" name="telephone" className="champ" required />
        </div>
      </div>

      <div>
        <label className="etiquette" htmlFor="email">
          E-mail (facultatif)
        </label>
        <input id="email" name="email" type="email" className="champ" />
      </div>

      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="etiquette" htmlFor="service">
            Travail demande
          </label>
          <select
            id="service"
            name="service"
            className="champ"
            defaultValue={serviceParDefaut ?? ""}
          >
            <option value="">Autre chose - je decris ci-dessous</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.categorie} - {s.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiquette" htmlFor="quantite">
            Quantite
          </label>
          <input
            id="quantite"
            name="quantite"
            type="number"
            min={1}
            defaultValue={1}
            className="champ"
          />
        </div>
      </div>

      <div>
        <label className="etiquette" htmlFor="message">
          Decrivez le travail
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="champ"
          placeholder="Format, couleurs, support, date de livraison souhaitee..."
          required
        />
      </div>

      <div>
        <label className="etiquette" htmlFor="fichiers">
          Vos fichiers (logo, maquette, photo) - 5 fichiers max, 10 Mo chacun
        </label>
        <input
          id="fichiers"
          name="fichiers"
          type="file"
          multiple
          accept="image/*,application/pdf,.ai,.eps"
          className="champ file:mr-4 file:rounded-plaque file:border-0 file:bg-encre file:px-4 file:py-2 file:font-mono file:text-micro file:uppercase file:text-[#0A0D11]"
        />
      </div>

      <BoutonEnvoyer />
    </form>
  );
}
