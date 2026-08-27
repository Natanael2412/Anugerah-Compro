import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { projects } from "@/lib/data/projects";

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
export default function HomePage() {
  return (
    <>
      {/* Section 1: The Core — Hero */}
      <HeroSection />

      {/* Section 2: The Curtained Narrative */}
      <CurtainedNarrative />

      {/* Section 3: The Horizontal Showcase */}
      <HorizontalShowcase projects={projects} />
    </>
  );
}
