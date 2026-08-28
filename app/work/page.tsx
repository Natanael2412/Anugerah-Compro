import type { Metadata } from "next";
import { getPublishedProjects } from "@/lib/data/projects";
import WorkGrid from "@/components/sections/WorkGrid";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Portofolio proyek Anugerah Ventures — arsitektur produk, transformasi digital, dan kepemimpinan teknis di berbagai industri.",
  openGraph: {
    title: "Work — Anugerah Ventures",
    description:
      "Portofolio proyek: arsitektur produk, transformasi digital, dan kepemimpinan teknis.",
  },
};

export default async function WorkPage() {
  const projects = await getPublishedProjects();

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Page header */}
      <header
        style={{
          paddingTop: "calc(var(--nav-height, 64px) + 6vh)",
          paddingBottom: "4vh",
          paddingLeft: "var(--page-margin)",
          paddingRight: "var(--page-margin)",
          borderBottom: "1px solid rgba(192,192,192,0.07)",
          background: "var(--color-surface)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-citadel)",
            fontSize: "0.8rem",
            fontStyle: "italic",
            letterSpacing: "0.2em",
            color: "var(--color-silver)",
            marginBottom: "1rem",
            textTransform: "uppercase",
          }}
          aria-hidden="true"
        >
          02
        </p>
        <h1
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "var(--color-text)",
          }}
        >
          Work
        </h1>
        <p
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
            fontWeight: 300,
            color: "var(--color-text-muted)",
            marginTop: "1rem",
            maxWidth: "520px",
          }}
        >
          Arsitektur produk, transformasi digital, dan kepemimpinan teknis di berbagai industri.
        </p>
      </header>

      {/* Masonry grid + filters */}
      <main
        id="main-content"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(3rem, 6vh, 5rem) var(--page-margin)",
        }}
      >
        <WorkGrid projects={projects} />
      </main>

    </div>
  );
}
