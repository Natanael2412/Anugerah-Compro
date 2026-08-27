import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import WorkDetailClient from "./WorkDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Pre-render all known project slugs at build time */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** Per-slug SEO metadata */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} — Anugerah Ventures`,
      description: project.description,
      type: "article",
    },
  };
}

/** Work detail page — Server Component */
export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <WorkDetailClient project={project} />;
}
