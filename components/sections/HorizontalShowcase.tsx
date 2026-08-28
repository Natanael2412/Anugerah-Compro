"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import type { Project } from "@/lib/data/projects";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   THE HORIZONTAL SHOWCASE — Section 3

   PRD Spec:
   - Horizontal sticky scroll (GSAP pinning)
   - TanStack Virtual for DOM virtualization of cards
   - Hardcoded data (Supabase integration in Phase 4)

   Architecture:
   ┌─ section (GSAP pin target, overflow:hidden) ──────────┐
   │  ┌─ scrollDriver (overflow-x:scroll, invisible) ──┐   │
   │  │  ← TanStack Virtual reads this for visibility  │   │
   │  └─────────────────────────────────────────────────┘   │
   │  ┌─ track (translateX driven by GSAP) ────────────┐   │
   │  │  [Card 0] [Card 1] [Card 2] ...                │   │
   │  │  (only visible cards rendered by TanStack)     │   │
   │  └─────────────────────────────────────────────────┘   │
   └────────────────────────────────────────────────────────┘

   How TanStack Virtual + GSAP co-exist:
   - GSAP ScrollTrigger maps vertical scroll → horizontal translateX on track
   - On each GSAP update, scrollDriver.scrollLeft is synced to GSAP progress
   - TanStack Virtual monitors scrollDriver to determine which cards to render
   - Cards are placed with position:absolute + left:virtualItem.start
   - Since cards are inside the moving track, they translate correctly
   ============================================================ */

const CARD_WIDTH = 420;
const CARD_GAP = 40;
const ITEM_SIZE = CARD_WIDTH + CARD_GAP;

interface HorizontalShowcaseProps {
  projects: Project[];
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      {/* Decorative index — Citadel font */}
      <span className="card-index" aria-hidden="true">
        {String(project.index).padStart(2, "0")}
      </span>

      {/* Card content */}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-category">{project.category}</span>
          <span className="card-year">{project.year}</span>
        </div>

        <h3 className="card-title">{project.title}</h3>

        <p className="card-description">{project.description}</p>

        <ul className="card-tags" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag} className="card-tag">
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom: view link — mechanical hover */}
      <a
        href={`/work/${project.slug}`}
        className="card-link"
        aria-label={`View case study: ${project.title}`}
      >
        <span>View case</span>
        <span className="card-link-arrow" aria-hidden="true">→</span>
      </a>

      <style jsx>{`
        .project-card {
          width: ${CARD_WIDTH}px;
          height: 100%;
          background: var(--color-surface);
          border: 1px solid rgba(192, 192, 192, 0.08);
          display: flex;
          flex-direction: column;
          padding: clamp(1.5rem, 2.5vw, 2.5rem);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s var(--ease-mechanical);
        }

        .project-card:hover {
          border-color: rgba(192, 192, 192, 0.2);
        }

        /* Top-right corner accent */
        .project-card::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 60px;
          height: 60px;
          background: linear-gradient(
            225deg,
            rgba(192, 192, 192, 0.06) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        /* Large decorative index number */
        .card-index {
          font-family: var(--font-citadel);
          font-size: clamp(4rem, 7vw, 6rem);
          font-weight: 700;
          line-height: 1;
          font-style: italic;
          /* Metallic gradient */
          background: var(--gradient-silver);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.25;
          margin-bottom: auto;
          display: block;
        }

        .card-body {
          margin-top: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-category {
          font-family: var(--font-helvetica);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-silver);
        }

        .card-year {
          font-family: var(--font-citadel);
          font-size: 0.8rem;
          color: var(--color-text-subtle);
          font-style: italic;
        }

        .card-title {
          font-family: var(--font-helvetica);
          font-size: clamp(1.1rem, 1.6vw, 1.4rem);
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1.25;
          color: var(--color-text);
        }

        .card-description {
          font-family: var(--font-helvetica);
          font-size: 0.85rem;
          font-weight: 300;
          line-height: 1.65;
          color: var(--color-text-muted);
          flex: 1;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          list-style: none;
          margin-top: auto;
          padding-top: 1rem;
        }

        .card-tag {
          font-family: var(--font-helvetica);
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
          border: 1px solid rgba(192, 192, 192, 0.12);
          padding: 0.25rem 0.6rem;
          border-radius: 2px;
        }

        /* View case link */
        .card-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(192, 192, 192, 0.08);
          font-family: var(--font-helvetica);
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
          text-decoration: none;
          transition: color 0.3s var(--ease-mechanical);
        }

        .card-link:hover {
          color: var(--color-silver-light);
        }

        .card-link-arrow {
          transition: transform 0.3s var(--ease-mechanical);
        }

        .card-link:hover .card-link-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </article>
  );
}

export default function HorizontalShowcase({ projects }: HorizontalShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollDriverRef = useRef<HTMLDivElement>(null);

  const totalScrollWidth = projects.length * ITEM_SIZE + CARD_GAP;

  // --- TanStack Virtual: horizontal virtualizer ---
  // Monitors scrollDriverRef (hidden, overflow-x:scroll) for visibility calculations.
  // GSAP syncs scrollDriver.scrollLeft on each frame.
  const virtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => scrollDriverRef.current,
    estimateSize: () => ITEM_SIZE,
    horizontal: true,
    overscan: 2,
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const driver = scrollDriverRef.current;
      if (!section || !track || !driver) return;

      const maxTranslate = totalScrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -maxTranslate,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // Scroll distance = total horizontal travel
          end: () => `+=${maxTranslate}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Sync hidden scroll driver so TanStack Virtual knows position
            if (driver) {
              driver.scrollLeft = self.progress * maxTranslate;
            }
          },
        },
      });
    },
    { scope: sectionRef, dependencies: [totalScrollWidth] }
  );

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label="Selected work"
      className="showcase-section"
    >
      {/* Section header */}
      <div className="showcase-header">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p className="showcase-label" aria-hidden="true">
            <span className="showcase-label-num">02</span>
            <span className="showcase-label-divider" aria-hidden="true" />
            Selected Work
          </p>
          <Link
            href="/work"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(192,192,192,0.3)",
              paddingBottom: "4px",
              width: "fit-content",
              transition: "all 0.3s ease",
            }}
            className="view-all-link"
          >
            View All Projects →
          </Link>
        </div>
        <p className="showcase-scroll-hint" aria-hidden="true">
          Scroll to explore ↓
        </p>
      </div>

      {/* Hidden scroll driver — TanStack Virtual reads this */}
      <div
        ref={scrollDriverRef}
        aria-hidden="true"
        className="scroll-driver"
        style={{ width: "100%" }}
      >
        <div style={{ width: virtualizer.getTotalSize(), height: 1 }} />
      </div>

      {/* Visual horizontal track — GSAP translates this */}
      <div
        ref={trackRef}
        className="showcase-track"
        style={{
          // TanStack totalSize drives the track width
          width: virtualizer.getTotalSize(),
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const project = projects[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: virtualItem.start,
                width: CARD_WIDTH,
                height: "100%",
              }}
            >
              <ProjectCard project={project} />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .showcase-section {
          position: relative;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--color-base);
        }

        .showcase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 var(--page-margin);
          margin-bottom: clamp(2rem, 4vh, 3rem);
          flex-shrink: 0;
        }

        .showcase-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: var(--font-helvetica);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
        }

        .showcase-label-num {
          font-family: var(--font-citadel);
          font-size: 0.9rem;
          font-style: italic;
          color: var(--color-silver);
        }

        .showcase-label-divider {
          display: inline-block;
          width: 24px;
          height: 1px;
          background: rgba(192, 192, 192, 0.3);
        }

        .showcase-scroll-hint {
          font-family: var(--font-helvetica);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
        }

        .view-all-link:hover {
          color: var(--color-text);
          border-bottom-color: var(--color-text);
        }

        /* Hidden scroll driver — purely for TanStack Virtual measurement */
        .scroll-driver {
          position: absolute;
          top: -9999px;
          left: 0;
          overflow-x: scroll;
          height: 1px;
          visibility: hidden;
          pointer-events: none;
        }

        /* The moving track */
        .showcase-track {
          display: flex;
          align-items: center;
          height: calc(100vh - 8rem);
          padding: 0 var(--page-margin);
          will-change: transform;
          flex-shrink: 0;
        }
      `}</style>
    </section>
  );
}
