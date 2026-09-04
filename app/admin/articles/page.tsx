import Link from "next/link";
import { getAllArticles } from "@/lib/data/articles";
import AdminNav from "@/components/admin/AdminNav";
import DeleteArticleButton from "@/components/admin/DeleteArticleButton";

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("id-ID", { year: "numeric", month: "short", day: "numeric" }).format(new Date(dateStr));
}

export default async function AdminArticlesPage() {
  const articles = await getAllArticles();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main className="max-w-[1400px] mx-auto px-8 pb-16" style={{ marginLeft: "220px", paddingTop: "3rem" }}>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
          <div>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>Insights</p>
            <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              Articles
            </h1>
          </div>
          <Link
            href="/admin/articles/new"
            id="admin-add-article"
            style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", textDecoration: "none", padding: "0.6rem 1.2rem", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px" }}
          >
            + Write Article
          </Link>
        </div>

        {/* Mobile: Card list */}
        <div className="md:hidden flex flex-col gap-4">
          {articles.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)", fontSize: "0.875rem" }}>
              Belum ada artikel. Klik &quot;Write Article&quot; untuk membuat baru.
            </p>
          ) : (
            articles.map((article) => (
              <div
                key={article.id}
                style={{ background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.06)", borderRadius: "2px", padding: "1.25rem" }}
                className="flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", color: "var(--color-text)", lineHeight: "1.4" }}>{article.title}</p>
                  <span style={{
                    fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "0.2rem 0.5rem", borderRadius: "2px", border: "1px solid rgba(192,192,192,0.1)", whiteSpace: "nowrap" as const,
                    color: article.is_av_published ? "var(--color-silver)" : "var(--color-text-subtle)",
                    background: article.is_av_published ? "rgba(192,192,192,0.06)" : "transparent",
                  }}>
                    {article.is_av_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <time dateTime={article.published_at} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {formatDate(article.published_at)}
                  </time>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{article.reading_time || 0} min</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {article.tags?.slice(0, 3).map((t: string) => (
                    <span key={t} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.1)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-5 pt-3" style={{ borderTop: "1px solid rgba(192,192,192,0.06)" }}>
                  <Link href={`/insights/${article.slug}`} target="_blank" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-silver)", textDecoration: "none" }}>
                    View →
                  </Link>
                  <Link href={`/admin/articles/${article.id}/edit`} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", textDecoration: "none" }}>
                    Edit
                  </Link>
                  <DeleteArticleButton id={article.id} title={article.title} />
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
                {["Title", "Tags", "Published", "Reading", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-subtle)", textAlign: "left", padding: "0.75rem 1rem", fontWeight: 400 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} style={{ borderBottom: "1px solid rgba(192,192,192,0.05)" }}>
                  <td style={{ padding: "1rem", maxWidth: "340px" }}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", color: "var(--color-text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {article.title}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="flex gap-1.5 flex-wrap">
                      {article.tags?.slice(0, 2).map((t: string) => (
                        <span key={t} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.1)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <time dateTime={article.published_at} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {formatDate(article.published_at)}
                    </time>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{article.reading_time || 0}m</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
                      color: article.is_av_published ? "var(--color-silver)" : "var(--color-text-subtle)",
                      background: article.is_av_published ? "rgba(192,192,192,0.08)" : "transparent",
                      padding: "0.2rem 0.5rem", borderRadius: "2px", border: "1px solid rgba(192,192,192,0.1)"
                    }}>
                      {article.is_av_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div className="flex items-center gap-4">
                      <Link href={`/insights/${article.slug}`} target="_blank" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-silver)", textDecoration: "none" }}>
                        View →
                      </Link>
                      <Link href={`/admin/articles/${article.id}/edit`} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", textDecoration: "none" }}>
                        Edit
                      </Link>
                      <DeleteArticleButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)", fontSize: "0.875rem" }}>
                    Belum ada artikel. Klik &quot;Write Article&quot; untuk membuat baru.
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
