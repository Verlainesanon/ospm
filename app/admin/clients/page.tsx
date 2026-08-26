import { prisma } from "@/lib/db";
import { TitrePage, Carte, Vide, Champ } from "@/components/admin";
import { creerClient, modifierClient, supprimerClient } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Clients" };

const TYPES = ["PARTICULIER", "ENTREPRISE", "ECOLE", "INSTITUTION"];

export default async function AdminClients({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? "";
  const clients = await prisma.customer.findMany({
    where: q ? { nom: { contains: q, mode: "insensitive" } } : {},
    orderBy: { nom: "asc" },
    include: { _count: { select: { orders: true, invoices: true } } },
    take: 200,
  });

  return (
    <>
      <TitrePage titre="Clients" sousTitre="Fichier client de l'atelier." />

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <Carte
          titre={`${clients.length} client(s)`}
          action={
            <form className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Chercher un nom"
                className="champ py-2"
                aria-label="Chercher un client"
              />
              <BoutonEnvoi variante="contour">Chercher</BoutonEnvoi>
            </form>
          }
        >
          {clients.length === 0 ? (
            <Vide texte={q ? `Aucun client ne correspond a "${q}".` : "Aucun client enregistre."} />
          ) : (
            <div className="space-y-3">
              {clients.map((c) => (
                <article key={c.id} className="rounded-douce border border-plomb-noir/[0.08] p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-sans text-[1.0625rem] font-medium text-plomb-noir">{c.nom}</h3>
                    <p className="ref">
                      {c._count.orders} commande(s) · {c._count.invoices} facture(s)
                    </p>
                  </div>

                  <form action={modifierClient} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={c.id} />
                    <Champ label="Nom / raison sociale">
                      <input name="nom" defaultValue={c.nom} className="champ" />
                    </Champ>
                    <Champ label="Type">
                      <select name="type" defaultValue={c.type} className="champ">
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </Champ>
                    <Champ label="Telephone">
                      <input name="telephone" defaultValue={c.telephone ?? ""} className="champ" />
                    </Champ>
                    <Champ label="E-mail">
                      <input name="email" defaultValue={c.email ?? ""} className="champ" />
                    </Champ>
                    <div className="sm:col-span-2">
                      <BoutonEnvoi variante="contour">Enregistrer</BoutonEnvoi>
                    </div>
                  </form>

                  <form
                    action={supprimerClient}
                    className="mt-4 border-t border-plomb-noir/[0.08] pt-3"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                      Supprimer ce client
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </Carte>

        <Carte titre="Nouveau client" className="lg:sticky lg:top-8">
          <form action={creerClient} className="space-y-4">
            <Champ label="Nom / raison sociale">
              <input name="nom" className="champ" required />
            </Champ>
            <Champ label="Type">
              <select name="type" className="champ">
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Champ>
            <Champ label="Telephone">
              <input name="telephone" className="champ" />
            </Champ>
            <Champ label="WhatsApp">
              <input name="whatsapp" className="champ" />
            </Champ>
            <Champ label="E-mail">
              <input name="email" type="email" className="champ" />
            </Champ>
            <Champ label="Adresse">
              <input name="adresse" className="champ" />
            </Champ>
            <BoutonEnvoi variante="encre" pleineLargeur>Enregistrer le client</BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}
