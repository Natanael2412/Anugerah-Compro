"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/* ============================================================
   SECTION 1: THE CORE — Hero

   PRD Spec:
   - 100vh, pure typography, NO buttons
   - Headline: Helvetica (Inter) dominant
   - Accent: Citadel (Playfair Display) for one word
   - Background: WebGL grain shader (Layer 0, rendered in layout)
   - Entrance: lines rise from bottom on load via GSAP
   ============================================================ */

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  // GSAP entrance — lines rise from y:50 → y:0, staggered on mount
  useGSAP(
    () => {
      // Use CSS selectors scoped to heroRef — avoids nullable Element refs.
      // useGSAP scope ensures selectors only match within the hero section.
      // GSAP treats an empty NodeList as a no-op, so no null-guard needed.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-eyebrow", { opacity: 0, y: 12, duration: 0.8 }, 0)
        .from(".hero-line-inner", { y: "105%", duration: 1.1, stagger: 0.08 }, 0.15)
        .from(".hero-tagline", { opacity: 0, y: 10, duration: 0.8 }, 0.6)
        .from(".hero-scroll-indicator", { opacity: 0, duration: 0.8 }, 0.9);
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label="Hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding:
          "calc(var(--nav-height, 64px) + 4vh) clamp(1.5rem, 8vw, 9rem) 6rem",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "clamp(1rem, 2vh, 1.5rem)" }}>

        {/* Eyebrow — Citadel, decorative */}
        <p
          className="hero-eyebrow"
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-citadel)",
            fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
            fontStyle: "italic",
            letterSpacing: "0.25em",
            color: "var(--color-silver)",
            textTransform: "uppercase",
          }}
        >
          Anugerah Ventures
        </p>

        {/* Main headline — each line clipped for reveal animation */}
        <h1
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-helvetica)",
            fontWeight: 300,
            fontSize: "clamp(3.5rem, 9vw, 8.5rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
            color: "var(--color-text)",
            gap: 0,
          }}
        >
          {/* Line 1 */}
          <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.05em" }}>
            <span className="hero-line-inner" style={{ display: "block" }}>
              Sistem yang
            </span>
          </span>

          {/* Line 2: Citadel accent word */}
          <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.05em" }}>
            <span className="hero-line-inner" style={{ display: "block" }}>
              <em
                style={{
                  fontFamily: "var(--font-citadel)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  background: "var(--gradient-silver)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Bekerja
              </em>
            </span>
          </span>

          {/* Line 3 */}
          <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.05em" }}>
            <span className="hero-line-inner" style={{ display: "block" }}>
              Tanpa Kompromi
            </span>
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="hero-tagline"
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(0.65rem, 0.85vw, 0.8rem)",
            fontWeight: 400,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            marginTop: "clamp(0.5rem, 1.5vh, 1.25rem)",
          }}
        >
          Arsitektur produk · Kepemimpinan teknis · Transformasi digital
        </p>
      </div>

      {/* Scroll indicator — bottom-left */}
      <div
        className="hero-scroll-indicator"
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 4vh, 3rem)",
          left: "var(--page-margin)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            display: "block",
            width: "1px",
            height: "40px",
            background:
              "linear-gradient(to bottom, var(--color-silver) 0%, transparent 100%)",
            animation: "scrollPulse 2.4s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            writingMode: "vertical-rl",
          }}
        >
          Scroll
        </span>
      </div>

      {/* Keyframe for scroll pulse — injected as plain <style> (OK in client component) */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50%       { opacity: 0.8; transform: scaleY(1.15); }
        }
      `}</style>
    </section>
  );
}
