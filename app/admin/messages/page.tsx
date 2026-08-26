import { prisma } from "@/lib/db";
import { TitrePage, Carte, Vide } from "@/components/admin";
import { basculerLu, supprimerMessage } from "./actions";

export const metadata = { title: "Messages" };

export default async function AdminMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ lu: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <>
      <TitrePage
        titre="Messages"
        sousTitre="Messages laisses depuis le formulaire de contact du site."
      />

      <div className="space-y-4">
        {messages.length === 0 && (
          <Carte>
            <Vide texte="Aucun message recu." />
          </Carte>
        )}

        {messages.map((m) => (
          <Carte key={m.id} titre={`${m.nom} - ${m.createdAt.toLocaleString("fr-FR")}`}>
            {m.sujet && (
              <p className="font-display text-base font-bold uppercase text-plomb-noir">
                {m.sujet}
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-plomb-noir">{m.message}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-plomb-noir/[0.08] pt-3">
              {m.telephone && (
                <a
                  href={`tel:${m.telephone}`}
                  className="text-micro font-medium text-encre hover:text-rouge"
                >
                  {m.telephone}
                </a>
              )}
              {m.email && (
                <a
                  href={`mailto:${m.email}`}
                  className="text-micro font-medium text-encre hover:text-rouge"
                >
                  {m.email}
                </a>
              )}
              <form action={basculerLu}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="lu" value={m.lu ? "0" : "1"} />
                <button className="text-micro text-plomb hover:text-encre">
                  {m.lu ? "Marquer non lu" : "Marquer lu"}
                </button>
              </form>
              <form action={supprimerMessage}>
                <input type="hidden" name="id" value={m.id} />
                <button className="text-micro font-medium text-rouge hover:underline">
                  Supprimer
                </button>
              </form>
            </div>
          </Carte>
        ))}
      </div>
    </>
  );
}
