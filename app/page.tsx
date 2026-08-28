import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublishedArticles } from "@/lib/data/articles";

/**
 * All three sections are Client Components (GSAP / TanStack).
 * Dynamic import keeps the initial Server Component bundle lean.
 */
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"));
const CurtainedNarrative = dynamic(
  () => import("@/components/sections/CurtainedNarrative")
);
const HorizontalShowcase = dynamic(
  () => import("@/components/sections/HorizontalShowcase")
);
const LatestInsights = dynamic(
  () => import("@/components/sections/LatestInsights")
);

/* ============================================================
   PAGE METADATA
   ============================================================ */
export const metadata: Metadata = {
  title: "Anugerah Ventures",
  description:
    "Anugerah Ventures — Sistem yang bekerja ketika skalanya berubah. Arsitektur produk, kepemimpinan teknis, dan transformasi digital di Jakarta.",
  openGraph: {
    title: "Anugerah Ventures",
    description:
      "Sistem yang bekerja ketika skalanya berubah. Arsitektur produk, kepemimpinan teknis, dan transformasi digital.",
  },
};

/* ============================================================
   HOME PAGE (Server Component — no styled-jsx, no client APIs)
   ============================================================ */
export default async function HomePage() {
  const [publishedProjects, publishedArticles] = await Promise.all([
    getPublishedProjects(),
    getPublishedArticles()
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Anugerah Ventures",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anugerahventures.com",
    description: "Bespoke digital experiences, strategic technology leadership, and enterprise product development.",
    sameAs: [],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jakarta",
      addressCountry: "ID",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Section 1: The Core — Hero */}
      <HeroSection />

      {/* Section 2: The Curtained Narrative */}
      <CurtainedNarrative />

      {/* Section 3: The Horizontal Showcase */}
      <HorizontalShowcase projects={publishedProjects} />

      {/* Section 4: Latest Insights */}
      <LatestInsights articles={publishedArticles} />
    </>
  );
}
