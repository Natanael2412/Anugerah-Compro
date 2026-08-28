"use client";

import Link from "next/link";
import type { Article } from "@/lib/data/articles";

interface Props {
  articles: Article[];
}

export default function LatestInsights({ articles }: Props) {
  // Ambil maksimal 4 artikel terbaru
  const latest = articles.slice(0, 4);

  return (
    <section
      id="insights"
      style={{
        padding: "clamp(4rem, 8vh, 8rem) var(--page-margin)",
        background: "var(--color-base)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "clamp(3rem, 6vh, 4rem)",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                marginBottom: "1rem",
              }}
              aria-hidden="true"
            >
              <span
                style={{
                  fontFamily: "var(--font-citadel)",
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  color: "var(--color-silver)",
                }}
              >
                03
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: "24px",
                  height: "1px",
                  background: "rgba(192, 192, 192, 0.3)",
                }}
                aria-hidden="true"
              />
              Insights & Thinking
            </p>
            <h2
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                color: "var(--color-text)",
              }}
            >
              Latest Articles
            </h2>
          </div>
          
          <Link
            href="/insights"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(192,192,192,0.3)",
              paddingBottom: "4px",
              transition: "all 0.3s ease",
            }}
            className="view-all-link"
          >
            Read All Insights →
          </Link>
        </div>

        {/* Article Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {latest.map((article) => (
            <Link
              key={article.id}
              href={`/insights/${article.slug}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
              className="article-card"
            >
              <article
                style={{
                  padding: "2rem",
                  background: "var(--color-surface)",
                  border: "1px solid rgba(192,192,192,0.08)",
                  borderRadius: "2px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <time
                    style={{
                      fontFamily: "var(--font-helvetica)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    {new Date(article.published_at!).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span
                    style={{
                      fontFamily: "var(--font-helvetica)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    {article.reading_time || 0}m
                  </span>
                </div>
                
                <h3
                  style={{
                    fontFamily: "var(--font-helvetica)",
                    fontSize: "1.1rem",
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: "var(--color-text)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {article.title}
                </h3>
                
                {article.excerpt && (
                  <p
                    style={{
                      fontFamily: "var(--font-helvetica)",
                      fontSize: "0.8rem",
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: "var(--color-text-muted)",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {article.excerpt}
                  </p>
                )}
                
                <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-helvetica)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--color-silver)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    className="read-more"
                  >
                    Read article <span className="arrow" style={{ transition: "transform 0.3s" }}>→</span>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .view-all-link:hover {
          color: var(--color-text);
          border-bottom-color: var(--color-text);
        }
        .article-card article:hover {
          border-color: rgba(192,192,192,0.25);
          background: rgba(255,255,255,0.015);
        }
        .article-card:hover .arrow {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
