import Link from "next/link";

export default function WorkNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-citadel)",
          fontSize: "clamp(5rem, 15vw, 12rem)",
          fontWeight: 700,
          fontStyle: "italic",
          background: "var(--gradient-silver)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: 0.3,
          lineHeight: 1,
          marginBottom: "1.5rem",
        }}
        aria-hidden="true"
      >
        404
      </p>
      <h1
        style={{
          fontFamily: "var(--font-helvetica)",
          fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
          fontWeight: 300,
          color: "var(--color-text)",
          marginBottom: "0.75rem",
        }}
      >
        Project not found
      </h1>
      <p
        style={{
          fontFamily: "var(--font-helvetica)",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          marginBottom: "2.5rem",
        }}
      >
        The project you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/#work"
        style={{
          fontFamily: "var(--font-helvetica)",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-silver)",
          textDecoration: "none",
        }}
      >
        ← Back to Work
      </Link>
    </div>
  );
}
