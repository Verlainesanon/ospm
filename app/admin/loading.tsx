import { Loader } from "@/components/loader";

// Affiche pendant la navigation entre deux ecrans de l'administration.
export default function Chargement() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <Loader />
      <p className="text-micro text-plomb">Chargement</p>
    </div>
  );
}
