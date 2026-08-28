"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="floating-logo-container">
      <Link
        href="/"
        className="floating-logo"
        aria-label="Anugerah Ventures — Home"
      >
        <img 
          src="/Logo-AV.avif" 
          alt="Anugerah Ventures" 
          style={{ 
            width: "auto", 
            height: "clamp(36px, 6vh, 56px)", // 150% dari original (max 56px)
            objectFit: "contain",
            display: "block"
          }}
        />
      </Link>

      <style jsx>{`
        .floating-logo-container {
          position: fixed;
          top: clamp(1rem, 3vh, 2rem);
          left: var(--page-margin);
          z-index: 50;
          pointer-events: none; /* Allows clicking through the container if it overlaps anything */
        }

        .floating-logo {
          display: block;
          pointer-events: auto; /* Re-enable clicking on the logo itself */
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }

        .floating-logo:hover {
          transform: scale(1.02);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
