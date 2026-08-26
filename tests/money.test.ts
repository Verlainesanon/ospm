import { describe, it, expect } from "vitest";
import { formatMontant, sousTotal, totalDocument, convertir } from "@/lib/money";

describe("formatMontant", () => {
  it("affiche les gourdes avec le suffixe G", () => {
    expect(formatMontant(1250.5, "HTG")).toContain("G");
    expect(formatMontant(1250.5, "HTG")).toContain("250,50");
  });

  it("affiche les dollars avec le prefixe $", () => {
    expect(formatMontant(10, "USD").startsWith("$")).toBe(true);
  });

  it("traite null comme zero", () => {
    expect(formatMontant(null)).toContain("0,00");
  });
});

describe("totaux", () => {
  const lignes = [
    { quantite: 3, prixUnitaire: 350 },
    { quantite: 2, prixUnitaire: 125.5 },
  ];

  it("calcule le sous-total", () => {
    expect(sousTotal(lignes)).toBe(1301);
  });

  it("applique remise et taxe", () => {
    expect(totalDocument(lignes, 100, 50).total).toBe(1251);
  });

  it("ne descend jamais sous zero", () => {
    expect(totalDocument(lignes, 5000).total).toBe(0);
  });
});

describe("convertir", () => {
  it("convertit USD vers HTG au taux donne", () => {
    expect(convertir(10, "USD", "HTG", 132)).toBe(1320);
  });

  it("convertit HTG vers USD", () => {
    expect(convertir(1320, "HTG", "USD", 132)).toBe(10);
  });

  it("ne touche pas une conversion vers la meme devise", () => {
    expect(convertir(500, "HTG", "HTG", 132)).toBe(500);
  });
});
