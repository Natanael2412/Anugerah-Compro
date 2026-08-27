import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { articles } from "@/lib/data/articles";
import ReadingProgress from "@/components/article/ReadingProgress";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} — Anugerah Ventures`,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
  };
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) notFound();

  // Compile Markdown to React — server-side (no client JS needed)
  const { content } = await compileMDX({
    source: article.content_md,
    options: { parseFrontmatter: false },
  });

  // ── JSON-LD Schema.org — BlogPosting ──────────────────────
  // Required by PRD for SEO, AEO, GEO authority signaling.
  // Recognized by Google AI, Perplexity, ChatGPT as high-authority content.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "Anugerah Ventures",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anugerahventures.id",
    },
    publisher: {
      "@type": "Organization",
      name: "Anugerah Ventures",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anugerahventures.id",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://anugerahventures.id"}/insights/${article.slug}`,
    },
    keywords: article.tags.join(", "),
    inLanguage: "id-ID",
    articleSection: article.tags[0] ?? "Insights",
  };

  return (
    <>
      {/* JSON-LD injected into <head> via Next.js script tag convention */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Reading progress bar (GSAP, client) */}
      <ReadingProgress articleId="article-body" />

      <div style={{ minHeight: "100vh" }}>

        {/* Article header */}
        <header
          style={{
            paddingTop: "calc(var(--nav-height, 64px) + 6vh)",
            paddingBottom: "4vh",
            paddingLeft: "clamp(1.5rem, 8vw, 9rem)",
            paddingRight: "clamp(1.5rem, 8vw, 9rem)",
            background: "var(--color-surface)",
            borderBottom: "1px solid rgba(192,192,192,0.07)",
          }}
        >
          {/* Tags */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {article.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-silver)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              color: "var(--color-text)",
              maxWidth: "860px",
              marginBottom: "1.5rem",
            }}
          >
            {article.title}
          </h1>

          {/* Meta: date + reading time */}
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <time
              dateTime={article.publishedAt}
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                color: "var(--color-text-subtle)",
              }}
            >
              {formatDate(article.publishedAt)}
            </time>
            <span style={{ color: "var(--color-text-subtle)", fontSize: "0.7rem" }}>·</span>
            <span
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                color: "var(--color-text-subtle)",
              }}
            >
              {article.readingTime} menit baca
            </span>
          </div>
        </header>

        {/* ── ARTICLE BODY ────────────────────────────────────── */}
        {/* max-width: 65ch per PRD for optimal reading comfort */}
        <article
          id="article-body"
          style={{
            maxWidth: "65ch",
            margin: "0 auto",
            padding: "clamp(3rem, 7vh, 5rem) clamp(1.5rem, 4vw, 2rem)",
          }}
        >
          <div className="prose-av">
            {content}
          </div>
        </article>

        {/* Bottom nav */}
        <div
          style={{
            maxWidth: "65ch",
            margin: "0 auto",
            padding: "2rem clamp(1.5rem, 4vw, 2rem) 6rem",
            borderTop: "1px solid rgba(192,192,192,0.07)",
          }}
        >
          <a
            href="/insights"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-silver)",
              textDecoration: "none",
            }}
          >
            ← All Insights
          </a>
        </div>
      </div>

    </>
  );
}
