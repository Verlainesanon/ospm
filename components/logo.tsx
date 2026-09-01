import Image from "next/image";

// Le logo est un JPEG a fond blanc. Sur papier, `multiply` efface ce fond sans
// avoir a detourer le fichier — mais sur fond sombre le meme `multiply` noircit
// tout le logo et le rend illisible. En chambre noire on repasse donc en rendu
// normal, sur une plaque blanche, comme un autocollant imprime.
export function Logo({
  hauteur = 44,
  variante = "clair",
  className = "",
  priority = false,
}: {
  hauteur?: number;
  variante?: "clair" | "plaque";
  className?: string;
  priority?: boolean;
}) {
  const image = (
    <Image
      src="/logo.jpeg"
      alt="Official Services Printing and More"
      width={Math.round(hauteur * 1.79)}
      height={hauteur}
      priority={priority}
      className={variante === "clair" ? "mix-blend-multiply dark:mix-blend-normal" : ""}
      style={{ height: hauteur, width: "auto" }}
    />
  );

  if (variante === "plaque") {
    return (
      <span className={`inline-block rounded-douce bg-white px-3 py-2 ${className}`}>{image}</span>
    );
  }

  return (
    <span
      className={`inline-block dark:rounded-douce dark:bg-white dark:px-2 dark:py-1.5 ${className}`}
    >
      {image}
    </span>
  );
}

// Ruban CMJN repris de la trainee du logo : sert d'accent structurel, jamais
// de decor gratuit.
export function RubanCmjn({ className = "" }: { className?: string }) {
  return (
    // Cyan, magenta, jaune, noir : les quatre plaques, dans l'ordre.
    // La quatrieme est la plaque de noir — sur fond sombre elle disparaitrait,
    // donc on la tire en blanc de reserve, comme un tirage en negatif.
    <span aria-hidden className={`flex h-1 w-full overflow-hidden ${className}`}>
      <span className="flex-1 bg-[#00AEEF]" />
      <span className="flex-1 bg-[#EC008C]" />
      <span className="flex-1 bg-[#FFF200]" />
      <span className="flex-1 bg-[#0A0D11] dark:bg-[#F2EFE9]" />
    </span>
  );
}
