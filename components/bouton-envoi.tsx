"use client";

import { useFormStatus } from "react-dom";
import { Loader, VoileEnvoi } from "./loader";

// Bouton de soumission qui affiche le loader pendant l'envoi.
// A placer a l'interieur d'un <form>, y compris dans un composant serveur.
export function BoutonEnvoi({
  children,
  enCours,
  variante = "encre",
  pleineLargeur = false,
}: {
  children: string;
  enCours?: string;
  variante?: "encre" | "contour";
  pleineLargeur?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn-${variante} ${pleineLargeur ? "w-full" : ""} disabled:opacity-70`}
    >
      {pending ? (
        <>
          <span className="loader" style={{ ["--cell-size" as string]: "6px" }} aria-hidden />
          {enCours ?? "Envoi en cours"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Voile plein cadre pendant l'envoi. Le <form> parent doit etre `relative`.
export function VoileSiEnvoi({ titre, detail }: { titre?: string; detail?: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <VoileEnvoi titre={titre} detail={detail} />;
}

export { Loader };
