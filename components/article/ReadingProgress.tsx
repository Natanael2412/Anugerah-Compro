"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reading progress bar — fixed at top of page.
 * GSAP ScrollTrigger drives the scaleX transform based on article scroll depth.
 */
export default function ReadingProgress({ articleId }: { articleId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const bar = barRef.current;
    const article = document.getElementById(articleId);
    if (!bar || !article) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: article,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  });

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "var(--nav-height, 64px)",
        left: 0,
        right: 0,
        height: "2px",
        background: "rgba(192,192,192,0.08)",
        zIndex: 40,
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          background: "var(--gradient-silver)",
          transformOrigin: "left center",
          transform: "scaleX(0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
