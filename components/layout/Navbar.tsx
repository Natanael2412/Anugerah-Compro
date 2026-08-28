"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   NAVBAR — Smart Hide-on-Scroll Navigation
   
   Behavior:
   - Fixed, transparent at top of page
   - Glassmorphism activates after 20px scroll
   - Hides (slides up) when scrolling DOWN past threshold
   - Instantly reappears (slides down) on any UP scroll
   ============================================================ */

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const glassTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let lastScrollY = 0;
    let isHidden = false;
    const HIDE_THRESHOLD = 50; // px scrolled before hide activates

    // --- Hide/Show logic via ScrollTrigger onUpdate ---
    const scrollTrigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const currentY = self.scroll();
        const direction = self.direction; // 1 = down, -1 = up

        // Glass effect: toggle class based on scroll position
        if (currentY > 20) {
          nav.classList.add("is-scrolled");
        } else {
          nav.classList.remove("is-scrolled");
        }

        // Hide on scroll down (past threshold)
        if (direction === 1 && currentY > HIDE_THRESHOLD && !isHidden) {
          isHidden = true;
          gsap.to(nav, {
            yPercent: -100,
            duration: 0.35,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        }

        // Show on any scroll up
        if (direction === -1 && isHidden) {
          isHidden = false;
          gsap.to(nav, {
            yPercent: 0,
            duration: 0.45,
            ease: "power3.out",
            overwrite: "auto",
          });
        }

        lastScrollY = currentY;
      },
    });

    glassTriggerRef.current = scrollTrigger;

    return () => {
      scrollTrigger.kill();
    };
  }, []);

  return (
    <header
      ref={navRef}
      className="navbar"
      role="banner"
    >
      <nav
        className="navbar__inner"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="navbar__logo"
          aria-label="Anugerah Ventures — Home"
        >
          <Image 
            src="/Logo-AV.avif" 
            alt="Anugerah Ventures" 
            width={280} 
            height={64} 
            style={{ width: "auto", height: "clamp(48px, 7vh, 64px)", objectFit: "contain" }}
            priority
          />
        </Link>
      </nav>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          width: 100%;
          height: var(--nav-height, 64px);
          /* Transparent by default */
          background: transparent;
          border-bottom: 1px solid transparent;
          transition:
            background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            backdrop-filter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        /* Glassmorphism activates on scroll */
        .navbar.is-scrolled {
          background: rgba(12, 31, 32, 0.55);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border-bottom: 1px solid rgba(248, 249, 250, 0.06);
        }

        .navbar__inner {
          display: flex;
          align-items: center;
          justify-content: flex-end; /* Logo dipindah ke kanan */
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 3rem);
        }

        /* Logo */
        .navbar__logo {
          font-family: var(--font-citadel);
          font-size: clamp(1.1rem, 1.8vw, 1.4rem);
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--color-text);
          text-decoration: none;
          line-height: 1;
          position: relative;
          /* Metallic shimmer on hover */
          background: var(--color-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: background 0.3s ease;
        }

        .navbar__logo:hover {
          background: var(--gradient-silver);
          -webkit-background-clip: text;
          background-clip: text;
        }
      `}</style>
    </header>
  );
}
