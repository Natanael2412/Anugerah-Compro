import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anugerah Ventures — Under Development",
  description:
    "Anugerah Ventures is currently under development. Check back later.",
};

export default function HomePage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "var(--color-bg)",
      color: "var(--color-text)",
      fontFamily: "var(--font-helvetica)",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        opacity: 0,
        animation: "fadeIn 1s ease forwards"
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/Logo-AV.avif" 
          alt="Anugerah Ventures" 
          style={{ 
            width: "auto", 
            height: "clamp(60px, 10vh, 100px)",
            objectFit: "contain"
          }}
        />
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          textAlign: "center"
        }}>
          <h1 style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: "var(--color-text)",
            margin: 0
          }}>
            Under Development
          </h1>
          <p style={{
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            color: "var(--color-text-subtle)",
            maxWidth: "400px",
            lineHeight: 1.6,
            margin: 0
          }}>
            We are currently crafting a new digital experience. Please check back later.
          </p>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
