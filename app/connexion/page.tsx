import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FormulaireConnexion } from "./formulaire";
import { Logo, RubanCmjn } from "@/components/logo";

export const metadata = { title: "Connexion" };

export default async function Connexion() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-micro text-plomb hover:text-rouge">
          Retour au site
        </Link>

        <div className="mt-6">
          <Logo hauteur={56} priority />
          <RubanCmjn className="mt-4 max-w-[10rem]" />
          <p className="mt-4 text-micro font-medium uppercase tracking-[0.08em] text-plomb">
            Administration
          </p>
        </div>

        <div className="mt-8">
          <FormulaireConnexion />
        </div>

        <p className="mt-6 text-center text-micro text-plomb-clair">
          Acces reserve a l&apos;equipe OSPM.
        </p>
      </div>
    </main>
  );
}
