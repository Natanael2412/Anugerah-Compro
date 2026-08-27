import Link from "next/link";
import { projects } from "@/lib/data/projects";
import { articles } from "@/lib/data/articles";
import AdminNav from "@/components/admin/AdminNav";

const CARDS = [
  { label: "Projects", count: projects.length, href: "/admin/projects", cta: "Manage" },
  { label: "Articles", count: articles.length, href: "/admin/articles", cta: "Manage" },
  { label: "Published", count: projects.filter((p) => p.index > 0).length, href: "/admin/projects", cta: "View" },
];

export default function AdminDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <p style={{
            fontFamily: "var(--font-citadel)",
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: "var(--color-silver)",
            letterSpacing: "0.15em",
            marginBottom: "0.5rem",
          }}>
            Internal CMS
          </p>
          <h1 style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 300,
            color: "var(--color-text)",
            letterSpacing: "-0.01em",
          }}>
            Dashboard
          </h1>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
          {CARDS.map(({ label, count, href, cta }) => (
            <div key={label} style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(192,192,192,0.08)",
              padding: "1.75rem",
              borderRadius: "2px",
            }}>
              <p style={{ fontFamily: "var(--font-citadel)", fontSize: "2.5rem", fontStyle: "italic", color: "var(--color-silver)", lineHeight: 1, marginBottom: "0.5rem" }}>
                {count}
              </p>
              <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: "1.25rem" }}>
                {label}
              </p>
              <Link href={href} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-silver)", textDecoration: "none" }}>
                {cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { label: "Add Project", href: "/admin/projects/new" },
              { label: "Write Article", href: "/admin/articles/new" },
              { label: "← View Site", href: "/" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                id={`admin-action-${label.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  padding: "0.6rem 1.2rem",
                  border: "1px solid rgba(192,192,192,0.15)",
                  borderRadius: "2px",
                  transition: "border-color 0.2s ease",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
