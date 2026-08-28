"use client";

import { useRef } from "react";

/* ============================================================
   FOOTER — "The Terminal"

   PRD Rules:
   - Extremely minimalist
   - Displays email/coordinates with mechanical hover effect
   - STRICTLY NO "LET'S TALK", "GET IN TOUCH" or any CTA copy
   ============================================================ */

const CONTACT_EMAIL = "hello@anugerahventures.id";
const LOCATION = "Jakarta, Indonesia";
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer" id="footer" role="contentinfo">
      <div className="footer__inner">

        {/* Left column: coordinates */}
        <div className="footer__coordinates">
          <p className="footer__label">Koordinat</p>
          <address className="footer__address">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="footer__link"
              id="footer-email-link"
              aria-label={`Email kami di ${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            <span className="footer__location">{LOCATION}</span>
          </address>
        </div>

        {/* Right column: copyright + initials */}
        <div className="footer__meta">
          <span className="footer__monogram" aria-hidden="true">AV</span>
          <p className="footer__copyright">
            &copy; {CURRENT_YEAR} Anugerah Ventures
          </p>
        </div>

      </div>

      {/* Bottom rule */}
      <div className="footer__rule" aria-hidden="true" />

      <style jsx>{`
        .footer {
          position: relative;
          background: var(--color-surface);
          padding: clamp(3rem, 7vw, 5rem) 0 clamp(1.5rem, 3vw, 2rem);
          overflow: hidden;
        }

        /* Subtle top border */
        .footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(192, 192, 192, 0.15) 30%,
            rgba(192, 192, 192, 0.15) 70%,
            transparent 100%
          );
        }

        .footer__inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--page-margin);
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer__label {
          font-family: var(--font-helvetica);
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
          margin-bottom: 0.75rem;
        }

        .footer__address {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-style: normal;
        }

        /* Email link — mechanical hover effect */
        .footer__link {
          font-family: var(--font-helvetica);
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          font-weight: 300;
          letter-spacing: 0.04em;
          color: var(--color-text-muted);
          text-decoration: none;
          position: relative;
          display: inline-block;
          transition: color 0.3s var(--ease-mechanical);
        }

        /* Mechanical underline: expands from left */
        .footer__link::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 1px;
          background: var(--gradient-silver);
          transition: width 0.4s var(--ease-mechanical);
          transform-origin: left;
        }

        .footer__link:hover {
          color: var(--color-silver-light);
        }

        .footer__link:hover::after {
          width: 100%;
        }

        .footer__location {
          font-family: var(--font-helvetica);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: var(--color-text-subtle);
        }

        /* Right: monogram + copyright */
        .footer__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .footer__monogram {
          font-family: var(--font-citadel);
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700;
          letter-spacing: 0.1em;
          /* Metallic silver */
          background: var(--gradient-silver);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .footer__copyright {
          font-family: var(--font-helvetica);
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-text-subtle);
        }

        .footer__rule {
          max-width: 1400px;
          margin: 2rem auto 0;
          padding: 0 var(--page-margin);
          height: 1px;
          background: rgba(192, 192, 192, 0.06);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .footer__inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .footer__meta {
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
