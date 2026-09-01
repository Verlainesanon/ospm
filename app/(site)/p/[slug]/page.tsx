import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Section, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/anim";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  return { title: page?.titre ?? "Page", description: page?.metaDesc ?? undefined };
}

export default async function PageEditoriale({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || !page.publiee) notFound();

  return (
    <Section>
      <Eyebrow>OSPM</Eyebrow>
      <h1 className="mt-7 max-w-4xl text-enseigne">
        {page.titre}
      </h1>
      <div className="mt-8 max-w-2xl space-y-4 text-plomb">
        {page.contenu.split(/\n{2,}/).map((paragraphe, i) => (
          <p key={i} className="leading-relaxed">
            {paragraphe}
          </p>
        ))}
      </div>
    </Section>
  );
}
