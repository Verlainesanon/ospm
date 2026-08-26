import Image from "next/image";

// Le logo est un JPEG a fond blanc. Sur creme, `multiply` efface ce fond sans
// avoir a detourer le fichier ; sur fond sombre, on le pose sur une plaque
// blanche, comme un autocollant imprime.
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
      className={variante === "clair" ? "mix-blend-multiply" : ""}
      style={{ height: hauteur, width: "auto" }}
    />
  );

  if (variante === "plaque") {
    return (
      <span className={`inline-block rounded-plaque bg-white px-3 py-2 ${className}`}>{image}</span>
    );
  }

  return <span className={`inline-block ${className}`}>{image}</span>;
}

// Ruban CMJN repris de la trainee du logo : sert d'accent structurel, jamais
// de decor gratuit.
export function RubanCmjn({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`flex h-1 w-full overflow-hidden rounded-plaque ${className}`}>
      <span className="flex-1 bg-[#00AEEF]" />
      <span className="flex-1 bg-[#EC008C]" />
      <span className="flex-1 bg-[#FFF200]" />
      <span className="flex-1 bg-encre" />
    </span>
  );
}
