"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/data/projects";

interface Props {
  project: Project;
}

export default function WorkDetailClient({ project }: Props) {
  const [heroError, setHeroError] = useState(false);

  return (
    <article style={{ minHeight: "100vh", color: "var(--color-text)", background: "var(--color-background)" }}>

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
        {project.tech_stack && project.tech_stack.length > 0 && (
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
            {project.tech_stack.map((tag: string) => (
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
        )}
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
        {project.hero_image_url && !heroError ? (
          project.hero_image_url.toLowerCase().endsWith(".mp4") || project.hero_image_url.toLowerCase().endsWith(".webm") ? (
            <video
              src={project.hero_image_url}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={() => setHeroError(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={project.hero_image_url} 
              alt={project.title}
              onError={() => setHeroError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )
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
              {String((project as any).index || "AV").padStart(2, "0")}
            </span>
            <p
              style={{
                position: "absolute",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                textAlign: "center",
              }}
            >
              {heroError ? "Image Unavailable (Check Cloudflare R2 Permissions)" : "No Hero Image"}
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
              {project.live_url && (!project.project_status || project.project_status === "public") && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "1.5rem",
                    padding: "0.75rem 1.5rem",
                    background: "var(--color-silver)",
                    color: "#000",
                    fontFamily: "var(--font-helvetica)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontWeight: "bold",
                    borderRadius: "2px",
                  }}
                >
                  Visit Live Project ↗
                </a>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <p
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "var(--color-text-muted)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {project.description || "No description provided for this project."}
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        {project.gallery_urls && project.gallery_urls.length > 0 && (
          <section aria-labelledby="gallery-heading">
            <h2
              id="gallery-heading"
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.65rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                marginBottom: "2rem",
              }}
            >
              Project Gallery
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {project.gallery_urls.map((url, i) => {
                const isVideo = url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm");
                return (
                  <div 
                    key={i} 
                    style={{ 
                      position: "relative", 
                      width: "100%", 
                      paddingBottom: "66.66%", // 3:2 Aspect Ratio
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "2px",
                      overflow: "hidden"
                    }}
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-helvetica); font-size: 0.65rem; color: var(--color-text-subtle); text-align: center; padding: 1rem; position: absolute; top: 0; left: 0;">Video Unavailable</div>';
                          }
                        }}
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={url}
                        alt={`Gallery asset ${i + 1}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          // Instead of completely hiding it, let's show a subtle error state
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-helvetica); font-size: 0.65rem; color: var(--color-text-subtle); text-align: center; padding: 1rem; position: absolute; top: 0; left: 0;">Image Unavailable<br/>(Check R2 Public Access)</div>';
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
