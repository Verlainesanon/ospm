import { describe, it, expect } from "vitest";
import { can } from "@/lib/auth";

describe("permissions par role", () => {
  it("l'admin accede a tout", () => {
    for (const zone of ["contenu", "finance", "stock", "materiel", "impression", "rapports"]) {
      expect(can("ADMIN", zone)).toBe(true);
    }
  });

  it("le caissier touche la finance mais pas le contenu du site ni le stock", () => {
    expect(can("CAISSIER", "finance")).toBe(true);
    expect(can("CAISSIER", "contenu")).toBe(false);
    expect(can("CAISSIER", "stock")).toBe(false);
  });

  it("le technicien gere l'atelier mais pas l'argent", () => {
    expect(can("TECHNICIEN", "materiel")).toBe(true);
    expect(can("TECHNICIEN", "stock")).toBe(true);
    expect(can("TECHNICIEN", "finance")).toBe(false);
  });

  it("le gestionnaire ne cree pas de comptes hors zone contenu", () => {
    expect(can("GESTIONNAIRE", "contenu")).toBe(true);
    expect(can("GESTIONNAIRE", "zone-inexistante")).toBe(false);
  });
});
