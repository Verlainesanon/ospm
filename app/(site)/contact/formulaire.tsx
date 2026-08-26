"use client";

import { useFormState, useFormStatus } from "react-dom";
import { envoyerMessage, type EtatContact } from "./actions";

const initial: EtatContact = { ok: false, message: "" };

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-encre disabled:opacity-60">
      {pending ? "Envoi en cours" : "Envoyer le message"}
    </button>
  );
}

export function FormulaireContact() {
  const [etat, action] = useFormState(envoyerMessage, initial);

  return (
    <form action={action} className="plaque space-y-5 p-7">
      <h2 className="text-sous">
        Laisser un message
      </h2>

      {etat.message && (
        <p
          className={`rounded-plaque border px-4 py-3 text-sm ${
            etat.ok
              ? "border-encre/30 bg-encre/5 text-encre"
              : "border-rouge/30 bg-rouge/5 text-rouge-sombre"
          }`}
        >
          {etat.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="etiquette" htmlFor="nom">
            Nom
          </label>
          <input id="nom" name="nom" className="champ" required />
        </div>
        <div>
          <label className="etiquette" htmlFor="telephone">
            Telephone
          </label>
          <input id="telephone" name="telephone" className="champ" />
        </div>
      </div>

      <div>
        <label className="etiquette" htmlFor="email">
          E-mail
        </label>
        <input id="email" name="email" type="email" className="champ" />
      </div>

      <div>
        <label className="etiquette" htmlFor="sujet">
          Sujet
        </label>
        <input id="sujet" name="sujet" className="champ" />
      </div>

      <div>
        <label className="etiquette" htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" rows={5} className="champ" required />
      </div>

      <Bouton />
    </form>
  );
}
