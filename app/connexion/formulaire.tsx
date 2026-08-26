"use client";

import { useFormState, useFormStatus } from "react-dom";
import { connexion, type EtatLogin } from "./actions";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full bg-rouge text-white hover:bg-rouge-sombre disabled:opacity-60"
    >
      {pending ? "Connexion en cours" : "Se connecter"}
    </button>
  );
}

export function FormulaireConnexion() {
  const [etat, action] = useFormState(connexion, { erreur: "" } as EtatLogin);

  return (
    // Panneau sombre : les champs creux sont concus pour un fond profond.
    <form
      action={action}
      className="space-y-6 rounded-plaque bg-encre-nuit p-8 shadow-flottant"
    >
      {etat.erreur && (
        <p className="rounded-douce border border-rouge/40 bg-rouge/15 px-4 py-3 text-sm text-white">
          {etat.erreur}
        </p>
      )}

      <div>
        <label className="mb-2 block text-micro font-medium text-creme/50" htmlFor="email">
          Identifiant
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Username"
          className="champ-creux"
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-micro font-medium text-creme/50" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="champ-creux"
          autoComplete="current-password"
          required
        />
      </div>

      <Bouton />
    </form>
  );
}
