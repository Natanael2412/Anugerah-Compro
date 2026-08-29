"use client";

import Link from "next/link";
import type { Project } from "@/lib/data/projects";

interface Props {
  project: Project;
}

export default function WorkDetailClient({ project }: Props) {
  return (
    <article style={{ minHeight: "100vh", color: "var(--color-text)" }}>

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <header
        style={{
          paddingTop: "calc(var(--nav-height, 64px) + 6vh)",
          paddingBottom: "6vh",
          paddingLeft: "clamp(1.5rem, 8vw, 9rem)",
          paddingRight: "clamp(1.5rem, 8vw, 9rem)",
          borderBottom: "1px solid rgba(192,192,192,0.08)",
          background: "var(--color-surface)",
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "2rem" }}>
          <Link
            href="/#work"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-text-subtle)",
              textDecoration: "none",
            }}
          >
            ← Work
          </Link>
        </nav>

        {/* Category + Year */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
            }}
          >
            {project.role}
          </span>
          <span
            style={{
              fontFamily: "var(--font-citadel)",
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: "var(--color-text-subtle)",
            }}
          >
            {project.year}
          </span>
        </div>

        {/* Project title */}
        <h1
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(2.2rem, 5.5vw, 5rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            maxWidth: "900px",
          }}
        >
          {project.title}
        </h1>

        {/* Tags */}
        <ul
          aria-label="Technologies"
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            listStyle: "none",
            marginTop: "2rem",
          }}
        >
          {project.tech_stack?.map((tag: string) => (
            <li
              key={tag}
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                border: "1px solid rgba(192,192,192,0.12)",
                padding: "0.3rem 0.7rem",
                borderRadius: "2px",
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>

      {/* ── HERO IMAGE ───────────────────────────── */}
      <div
        role="img"
        aria-label={`Hero image for ${project.title}`}
        style={{
          width: "100%",
          height: "clamp(300px, 50vh, 600px)",
          background: "linear-gradient(135deg, #0c1f20 0%, #051011 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {project.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={project.hero_image_url} 
            alt={project.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <>
            {/* Decorative index placeholder */}
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-citadel)",
                fontSize: "clamp(8rem, 20vw, 18rem)",
                fontWeight: 700,
                fontStyle: "italic",
                background: "var(--gradient-silver)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                opacity: 0.08,
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              {String(project.index || "AV").padStart(2, "0")}
            </span>
            <p
              style={{
                position: "absolute",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
              }}
            >
              No Hero Image
            </p>
          </>
        )}
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────────── */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(3rem, 8vh, 6rem) clamp(1.5rem, 8vw, 9rem)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "5rem",
        }}
      >

        {/* Overview block */}
        <section aria-labelledby="overview-heading">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            <div>
              <h2
                id="overview-heading"
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--color-text-subtle)",
                  marginBottom: "0.5rem",
                }}
              >
                Overview
              </h2>
            </div>
            <p
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--color-text-muted)",
              }}
            >
              {project.description}
            </p>
          </div>
        </section>

        {/* Asymmetric content grid — placeholder blocks */}
        <section aria-labelledby="detail-heading">
          <h2
            id="detail-heading"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-text-subtle)",
              marginBottom: "2rem",
            }}
          >
            Technical Approach
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              { label: "Architecture", text: "Sistem dirancang dengan pemisahan domain yang tegas, memungkinkan skalasi independen antar komponen bisnis." },
              { label: "Technical Leadership", text: "Kepemimpinan teknis difokuskan pada pengambilan keputusan arsitektur yang berdampak jangka panjang, bukan detail implementasi." },
              { label: "Business Value", text: "Setiap keputusan teknis diukur terhadap dampak bisnis yang terukur — bukan kompleksitas teknis yang tidak perlu." },
            ].map(({ label, text }) => (
              <div
                key={label}
                style={{
                  padding: "2rem",
                  background: "var(--color-surface)",
                  border: "1px solid rgba(192,192,192,0.07)",
                  borderRadius: "2px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-citadel)",
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                    letterSpacing: "0.1em",
                    color: "var(--color-silver)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {label}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-helvetica)",
                    fontSize: "0.9rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
