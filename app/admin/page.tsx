import Link from "next/link";
import { getAllProjects } from "@/lib/data/projects";
import { getAllArticles } from "@/lib/data/articles";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminDashboardPage() {
  const projects = await getAllProjects();
  const articles = await getAllArticles();

  const CARDS = [
    { label: "Projects", count: projects.length, href: "/admin/projects", cta: "Manage" },
    { label: "Articles", count: articles.length, href: "/admin/articles", cta: "Manage" },
    { label: "Published", count: projects.filter((p) => p.is_av_published).length, href: "/admin/projects", cta: "View" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main className="max-w-[1400px] mx-auto px-8 pb-16" style={{ marginLeft: "220px", paddingTop: "3rem" }}>
        {/* Header */}
        <div className="mb-12">
          <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
            Internal CMS
          </p>
          <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Dashboard
          </h1>
        </div>

        {/* Stats grid — responsive via Tailwind grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {CARDS.map(({ label, count, href, cta }) => (
            <div
              key={label}
              style={{ background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.75rem", borderRadius: "2px" }}
            >
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
          <div className="flex flex-wrap gap-3">
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
