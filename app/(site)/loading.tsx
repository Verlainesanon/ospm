import { Loader } from "@/components/loader";

// Affiche pendant la navigation entre deux pages du site public.
export default function Chargement() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5">
      <Loader grand />
      <p className="text-micro text-plomb">Chargement</p>
    </div>
  );
}
