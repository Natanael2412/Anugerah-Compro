import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data/projects";
import WorkDetailClient from "./WorkDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}



/** Per-slug SEO metadata */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description ?? undefined,
    openGraph: {
      title: `${project.title} — Anugerah Ventures`,
      description: project.description ?? undefined,
      type: "article",
    },
  };
}

/** Work detail page — Server Component */
export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anugerahventures.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${BASE_URL}/work/${project.slug}`,
    dateCreated: String(project.year),
    creator: {
      "@type": "Organization",
      name: "Anugerah Ventures",
      url: BASE_URL,
    },
    keywords: project.tech_stack?.join(", "),
    ...(project.hero_image_url && { image: project.hero_image_url }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkDetailClient project={project} />
    </>
  );
}
