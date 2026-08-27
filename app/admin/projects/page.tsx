import Link from "next/link";
import { projects } from "@/lib/data/projects";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminProjectsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>
              Portfolio
            </p>
            <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              Projects
            </h1>
          </div>
          <Link
            href="/admin/projects/new"
            id="admin-add-project"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-text)",
              textDecoration: "none",
              padding: "0.6rem 1.2rem",
              border: "1px solid rgba(192,192,192,0.2)",
              borderRadius: "2px",
            }}
          >
            + Add Project
          </Link>
        </div>

        {/* Projects table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(192,192,192,0.1)" }}>
                {["#", "Title", "Category", "Year", "Tags", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: "var(--font-helvetica)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-text-subtle)",
                      textAlign: "left",
                      padding: "0.75rem 1rem",
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  style={{ borderBottom: "1px solid rgba(192,192,192,0.05)" }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "var(--font-citadel)", fontStyle: "italic", color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>
                      {String(project.index).padStart(2, "0")}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", color: "var(--color-text)", fontWeight: 400 }}>
                      {project.title}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {project.category}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "var(--font-citadel)", fontStyle: "italic", fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>
                      {project.year}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {project.tags.map((tag) => (
                        <span key={tag} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.1)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-silver)", background: "rgba(192,192,192,0.08)", padding: "0.2rem 0.5rem", borderRadius: "2px" }}>
                      Hardcoded
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/work/${project.slug}`}
                      target="_blank"
                      style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-silver)", textDecoration: "none" }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phase 4 note */}
        <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-subtle)", marginTop: "2rem", fontStyle: "italic" }}>
          ⚡ Phase 4: Hubungkan Supabase untuk edit, hapus, dan tambah proyek secara langsung dari CMS.
        </p>
      </main>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "1rem",
  verticalAlign: "middle",
};
