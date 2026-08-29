"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project } from "@/lib/data/projects";

interface Props {
  projects: Project[];
}

export default function WorkGrid({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<string>("All");

  // Collect unique roles
  const roles = useMemo(() => {
    const rls = new Set<string>();
    projects.forEach((p) => { if (p.role) rls.add(p.role); });
    return ["All", ...Array.from(rls)];
  }, [projects]);

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      const matchRole = activeRole === "All" || p.role === activeRole;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tech_stack?.some((t: string) => t.toLowerCase().includes(q)) ||
        p.role?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [projects, search, activeRole]);

  return (
    <>
      {/* ── Controls ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", maxWidth: "420px" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.75rem",
              color: "var(--color-text-subtle)",
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            id="work-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(192,192,192,0.12)",
              borderRadius: "2px",
              padding: "0.65rem 1rem 0.65rem 2.5rem",
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.82rem",
              color: "var(--color-text)",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(192,192,192,0.35)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(192,192,192,0.12)")}
          />
        </div>

        {/* Role filters */}
        <div
          role="group"
          aria-label="Filter by role"
          style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
        >
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "0.35rem 0.9rem",
                borderRadius: "2px",
                border: activeRole === role
                  ? "1px solid rgba(192,192,192,0.5)"
                  : "1px solid rgba(192,192,192,0.12)",
                background: activeRole === role
                  ? "rgba(192,192,192,0.1)"
                  : "transparent",
                color: activeRole === role
                  ? "var(--color-text)"
                  : "var(--color-text-subtle)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            color: "var(--color-text-subtle)",
          }}
        >
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
          {activeRole !== "All" && ` in ${activeRole}`}
          {search && ` matching "${search}"`}
        </p>
      </div>

      {/* ── Masonry Grid ── */}
      {filtered.length > 0 ? (
        <div
          style={{
            columns: "3 280px",
            columnGap: "1.25rem",
          }}
        >
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "6rem 0",
            color: "var(--color-text-subtle)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-citadel)",
              fontSize: "1.5rem",
              fontStyle: "italic",
              marginBottom: "0.75rem",
            }}
          >
            —
          </p>
          <p
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
            }}
          >
            No projects found
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          #work-search { max-width: 100%; }
        }
        .project-card { break-inside: avoid; }
        .project-card:hover .project-card-img { transform: scale(1.03); }
        .project-card:hover .project-card-overlay { opacity: 1; }
        .project-card:hover .project-card-arrow { transform: translateX(4px); }
      `}</style>
    </>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  // Vary card sizes for natural masonry feel
  const isWide = index % 5 === 0 || index % 7 === 3;
  const hasImage = !!project.hero_image_url;

  return (
    <div
      className="project-card"
      style={{
        marginBottom: "1.25rem",
        display: "inline-block",
        width: "100%",
      }}
    >
      <Link
        href={`/work/${project.slug}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
        id={`project-card-${project.id}`}
      >
        <article
          style={{
            background: "var(--color-surface)",
            border: "1px solid rgba(192,192,192,0.07)",
            borderRadius: "2px",
            overflow: "hidden",
            transition: "border-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(192,192,192,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(192,192,192,0.07)";
          }}
        >
          {/* Image */}
          {hasImage && (
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                height: isWide ? "280px" : "200px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.hero_image_url!}
                alt={project.title}
                className="project-card-img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              />
              {/* Gradient overlay */}
              <div
                className="project-card-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
              />
            </div>
          )}

          {/* No-image placeholder */}
          {!hasImage && (
            <div
              style={{
                height: "100px",
                background: `linear-gradient(135deg, rgba(192,192,192,0.04) 0%, rgba(192,192,192,0.01) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-citadel)",
                  fontSize: "2rem",
                  fontStyle: "italic",
                  color: "rgba(192,192,192,0.15)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Content */}
          <div style={{ padding: "1.25rem" }}>
            {/* Category + Year */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.6rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-silver)",
                }}
              >
                {project.role}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-citadel)",
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                  color: "var(--color-text-subtle)",
                }}
              >
                {project.year}
              </span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.95rem",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
                color: "var(--color-text)",
                marginBottom: "0.6rem",
              }}
            >
              {project.title}
            </h2>

            {/* Description */}
            {project.description && (
              <p
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.78rem",
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: "var(--color-text-muted)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginBottom: "1rem",
                }}
              >
                {project.description}
              </p>
            )}

            {/* Tags + Arrow */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {project.tech_stack?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--font-helvetica)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-text-subtle)",
                      border: "1px solid rgba(192,192,192,0.1)",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "2px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className="project-card-arrow"
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.7rem",
                  color: "var(--color-silver)",
                  transition: "transform 0.25s ease",
                  display: "inline-block",
                }}
              >
                →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
