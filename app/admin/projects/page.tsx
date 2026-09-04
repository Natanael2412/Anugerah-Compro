import Link from "next/link";
import { getAllProjects } from "@/lib/data/projects";
import AdminNav from "@/components/admin/AdminNav";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main className="max-w-[1400px] mx-auto px-8 pb-16" style={{ marginLeft: "220px", paddingTop: "3rem" }}>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>Work</p>
            <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              Projects
            </h1>
          </div>
          <Link
            href="/admin/projects/new"
            id="admin-add-project"
            style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", textDecoration: "none", padding: "0.6rem 1.2rem", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px" }}
          >
            + Add Project
          </Link>
        </div>

        {/* Mobile: Card list */}
        <div className="md:hidden flex flex-col gap-4">
          {projects.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)", fontSize: "0.875rem" }}>
              Belum ada proyek. Klik &quot;Add Project&quot; untuk membuat baru.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={{ background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.06)", borderRadius: "2px", padding: "1.25rem" }}
                className="flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", color: "var(--color-text)", lineHeight: "1.4" }}>{project.title}</p>
                  <span style={{
                    fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "0.2rem 0.5rem", borderRadius: "2px", border: "1px solid rgba(192,192,192,0.1)", whiteSpace: "nowrap" as const,
                    color: project.is_av_published ? "var(--color-silver)" : "var(--color-text-subtle)",
                    background: project.is_av_published ? "rgba(192,192,192,0.06)" : "transparent",
                  }}>
                    {project.is_av_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)" }}>{project.role}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{project.year}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {project.tech_stack?.slice(0, 3).map((t: string) => (
                    <span key={t} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.1)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-5 pt-3" style={{ borderTop: "1px solid rgba(192,192,192,0.06)" }}>
                  <Link href={`/work/${project.slug}`} target="_blank" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-silver)", textDecoration: "none" }}>
                    View →
                  </Link>
                  <Link href={`/admin/projects/${project.id}/edit`} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", textDecoration: "none" }}>
                    Edit
                  </Link>
                  <DeleteProjectButton id={project.id} title={project.title} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(192,192,192,0.1)" }}>
                {["#", "Title", "Role", "Year", "Tech Stack", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-subtle)", textAlign: "left", padding: "0.75rem 1rem", fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} style={{ borderBottom: "1px solid rgba(192,192,192,0.05)" }}>
                  <td style={{ padding: "1rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)", fontSize: "0.75rem" }}>{project.index}</td>
                  <td style={{ padding: "1rem", maxWidth: "280px" }}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", color: "var(--color-text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {project.title}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)" }}>{project.role}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{project.year}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="flex gap-1.5 flex-wrap">
                      {project.tech_stack?.slice(0, 2).map((t: string) => (
                        <span key={t} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.1)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
                      color: project.is_av_published ? "var(--color-silver)" : "var(--color-text-subtle)",
                      background: project.is_av_published ? "rgba(192,192,192,0.08)" : "transparent",
                      padding: "0.2rem 0.5rem", borderRadius: "2px", border: "1px solid rgba(192,192,192,0.1)"
                    }}>
                      {project.is_av_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="flex items-center gap-4">
                      <Link href={`/work/${project.slug}`} target="_blank" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-silver)", textDecoration: "none" }}>
                        View →
                      </Link>
                      <Link href={`/admin/projects/${project.id}/edit`} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", textDecoration: "none" }}>
                        Edit
                      </Link>
                      <DeleteProjectButton id={project.id} title={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)", fontSize: "0.875rem" }}>
                    Belum ada proyek. Klik &quot;Add Project&quot; untuk membuat baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
