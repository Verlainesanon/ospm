// Loader d'envoi : neuf cases qui s'allument en cascade, du bleu d'encre au
// cyan d'impression. Utilise pendant l'upload de fichiers, ou l'attente peut
// durer plusieurs secondes sur une connexion lente.
export function Loader({ grand = false }: { grand?: boolean }) {
  return (
    <div className={`loader ${grand ? "loader-grand" : ""}`} role="status" aria-label="Envoi en cours">
      <div className="cell d-0" />
      <div className="cell d-1" />
      <div className="cell d-2" />
      <div className="cell d-1" />
      <div className="cell d-2" />
      <div className="cell d-2" />
      <div className="cell d-3" />
      <div className="cell d-3" />
      <div className="cell d-4" />
    </div>
  );
}

// Voile pose sur le formulaire pendant l'envoi : le loader, un titre, et le
// rappel qu'il ne faut pas fermer la page.
export function VoileEnvoi({
  titre = "Envoi des fichiers",
  detail = "Ne fermez pas cette page tant que le transfert n'est pas termine.",
}: {
  titre?: string;
  detail?: string;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-plaque bg-white/85 backdrop-blur-sm"
      aria-live="polite"
    >
      <Loader grand />
      <div className="px-6 text-center">
        <p className="text-[1.0625rem] font-medium text-plomb-noir">{titre}</p>
        <p className="mt-1.5 text-micro text-plomb">{detail}</p>
      </div>
    </div>
  );
}
