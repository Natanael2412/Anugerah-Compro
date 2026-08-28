import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Jurnal pemikiran tentang arsitektur produk, kepemimpinan teknis, dan transformasi digital dari perspektif praktisi.",
  openGraph: {
    title: "Insights — Anugerah Ventures",
    description:
      "Jurnal pemikiran tentang arsitektur produk, kepemimpinan teknis, dan transformasi digital.",
  },
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default async function InsightsPage() {
  const published = await getPublishedArticles();

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Page header */}
      <header
        style={{
          paddingTop: "calc(var(--nav-height, 64px) + 6vh)",
          paddingBottom: "4vh",
          paddingLeft: "var(--page-margin)",
          paddingRight: "var(--page-margin)",
          borderBottom: "1px solid rgba(192,192,192,0.07)",
          background: "var(--color-surface)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-citadel)",
            fontSize: "0.8rem",
            fontStyle: "italic",
            letterSpacing: "0.2em",
            color: "var(--color-silver)",
            marginBottom: "1rem",
            textTransform: "uppercase",
          }}
          aria-hidden="true"
        >
          03
        </p>
        <h1
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "var(--color-text)",
          }}
        >
          Insights
        </h1>
        <p
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
            fontWeight: 300,
            color: "var(--color-text-muted)",
            marginTop: "1rem",
            maxWidth: "520px",
          }}
        >
          Jurnal pemikiran tentang arsitektur produk, kepemimpinan teknis, dan transformasi digital.
        </p>
      </header>

      {/* Article grid */}
      <main
        id="main-content"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "clamp(3rem, 6vh, 5rem) var(--page-margin)",
        }}
      >
        <ul
          role="list"
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          {published.map((article, i) => (
            <li
              key={article.id}
              style={{
                borderBottom: "1px solid rgba(192,192,192,0.07)",
              }}
            >
              <Link
                href={`/insights/${article.slug}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
                id={`article-link-${article.id}`}
              >
                <article
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "clamp(1.5rem, 4vw, 4rem)",
                    alignItems: "center",
                    padding: "clamp(1.5rem, 3vh, 2.5rem) 0",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* Index */}
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: "var(--font-citadel)",
                      fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                      fontStyle: "italic",
                      color: "var(--color-text-subtle)",
                      minWidth: "2rem",
                      textAlign: "right",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      {article.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontFamily: "var(--font-helvetica)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--color-silver)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2
                      style={{
                        fontFamily: "var(--font-helvetica)",
                        fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                        color: "var(--color-text)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {article.title}
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-helvetica)",
                        fontSize: "0.875rem",
                        fontWeight: 300,
                        color: "var(--color-text-muted)",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.25rem",
                      flexShrink: 0,
                    }}
                  >
                    <time
                      dateTime={article.published_at}
                      style={{
                        fontFamily: "var(--font-helvetica)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        color: "var(--color-text-subtle)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(article.published_at)}
                    </time>
                    <span
                      style={{
                        fontFamily: "var(--font-helvetica)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.1em",
                        color: "var(--color-text-subtle)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {article.reading_time || 0} min read
                    </span>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
