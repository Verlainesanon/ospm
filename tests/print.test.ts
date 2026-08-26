import { describe, it, expect } from "vitest";
import { rendreGabarit, echapper, ticketTexte } from "@/lib/print";

describe("rendreGabarit", () => {
  it("remplace les champs connus", () => {
    expect(rendreGabarit("Facture {{numero}} - {{client}}", { numero: "FAC-1", client: "Jean" })).toBe(
      "Facture FAC-1 - Jean",
    );
  });

  it("vide les champs absents plutot que de laisser le gabarit brut", () => {
    expect(rendreGabarit("{{inconnu}}", {})).toBe("");
  });

  it("echappe les valeurs saisies par un client", () => {
    const rendu = rendreGabarit("{{client}}", { client: '<script>alert("x")</script>' });
    expect(rendu).not.toContain("<script>");
    expect(rendu).toContain("&lt;script&gt;");
  });

  it("laisse passer le HTML des lignes pre-rendues", () => {
    expect(rendreGabarit("{{lignes}}", { lignes: "<tr><td>A</td></tr>" })).toContain("<tr>");
  });
});

describe("echapper", () => {
  it("neutralise les caracteres dangereux", () => {
    expect(echapper('a & b < c > "d"')).toBe("a &amp; b &lt; c &gt; &quot;d&quot;");
  });
});

describe("ticketTexte", () => {
  const valeurs = {
    entreprise: "OSPM",
    adresse: "60 Rue Dessalines",
    telephone: "42-71-28-91",
    type: "RECU",
    numero: "REC-2026-0001",
    date: "23/08/2026",
    client: "Jean",
    total: "1 000,00 G",
    paye: "1 000,00 G",
    reste: "0,00 G",
    methode: "ESPECES",
    mention: "Merci",
  };

  it("contient le numero, le total et le mode de reglement", () => {
    const ticket = ticketTexte(valeurs, ["Badge x2 — 700,00 G"]);
    expect(ticket).toContain("REC-2026-0001");
    expect(ticket).toContain("TOTAL      1 000,00 G");
    expect(ticket).toContain("Regle par ESPECES");
    expect(ticket).toContain("Badge x2");
  });

  it("omet la ligne de reglement quand aucune methode n'est connue", () => {
    const ticket = ticketTexte({ ...valeurs, methode: "" }, []);
    expect(ticket).not.toContain("Regle par");
  });
});
