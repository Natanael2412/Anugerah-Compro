"use client";

import { useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   THE CURTAINED NARRATIVE — Section 2

   PRD Spec:
   - min-height: 150vh
   - Solid #051011 overlay covering the WebGL grain shader below
   - Text revealed word-by-word via GSAP ScrollTrigger scrub
   - Pure typography, no images

   Mechanism:
   - Outer container is scrollable (150vh gives scroll room)
   - Inner content is position:sticky so it stays in viewport
   - Copy text is split into <span> per word
   - Each word starts at opacity 0.12 (barely visible, "unlit")
   - GSAP scrub stagger lights each word to opacity 1 as user scrolls
   ============================================================ */

const NARRATIVE_COPY =
  "Kami tidak membangun produk. Kami merancang sistem yang bekerja — ketika skalanya berubah, ketika bisnis bergeser, ketika ekspektasi melampaui batas yang pernah ada. Setiap keputusan teknis adalah keputusan bisnis.";

/** Split string into word tokens, preserving punctuation attached to words */
function splitToWords(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean);
}

export default function CurtainedNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const words = useMemo(() => splitToWords(NARRATIVE_COPY), []);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      // Collect only actual word spans (not whitespace spans)
      const wordSpans = wordsRef.current.filter(Boolean);

      // --- Word-by-word scrub animation ---
      // Each word goes from dim (opacity 0.12) → lit (opacity 1)
      // using a stagger so they reveal sequentially as user scrolls
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      tl.to(wordSpans, {
        opacity: 1,
        stagger: {
          each: 0.07,
          ease: "none",
        },
        ease: "none",
        duration: 1,
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="narrative"
      aria-label="Our approach"
      className="curtain-section"
    >
      {/* Sticky inner: stays in viewport while outer scrolls */}
      <div className="curtain-sticky">
        {/* Section label */}
        <p className="curtain-label" aria-hidden="true">
          <span>01</span>
          <span className="curtain-label-divider" aria-hidden="true" />
          Approach
        </p>

        {/* The narrative — words as individually animated spans */}
        <p
          className="curtain-text"
          aria-label={NARRATIVE_COPY}
          role="text"
        >
          {words.map((word, i) => {
            // Whitespace tokens: render as-is, not animated
            if (/^\s+$/.test(word)) {
              return <span key={i}>{word}</span>;
            }
            return (
              <span
                key={i}
                ref={(el) => {
                  if (el) wordsRef.current[i] = el;
                }}
                className="curtain-word"
                aria-hidden="true"
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>

      <style jsx>{`
        .curtain-section {
          position: relative;
          min-height: 175vh;
          background: var(--color-surface);
        }

        /* Top gradient blending from base (#0C1F20) to surface (#051011) */
        .curtain-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 20vh;
          background: linear-gradient(
            to bottom,
            var(--color-base) 0%,
            var(--color-surface) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .curtain-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 var(--page-margin);
          z-index: 2;
        }

        /* Section label: Citadel number + divider + category */
        .curtain-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: var(--font-helvetica);
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
          margin-bottom: clamp(2rem, 4vh, 3.5rem);
        }

        .curtain-label span:first-child {
          font-family: var(--font-citadel);
          font-size: 0.9rem;
          font-style: italic;
          color: var(--color-silver);
        }

        .curtain-label-divider {
          display: inline-block;
          width: 24px;
          height: 1px;
          background: rgba(192, 192, 192, 0.3);
          flex-shrink: 0;
        }

        /* Narrative text */
        .curtain-text {
          font-family: var(--font-helvetica);
          font-size: clamp(1.6rem, 3.2vw, 3rem);
          font-weight: 300;
          line-height: 1.55;
          letter-spacing: -0.01em;
          max-width: 16em;
          color: var(--color-text);
        }

        /* Each word starts "unlit" — GSAP will light them up */
        .curtain-word {
          opacity: 0.12;
          display: inline;
          /* GPU composite hint */
          will-change: opacity;
        }
      `}</style>
    </section>
  );
}
