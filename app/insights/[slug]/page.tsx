import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getPublishedArticles } from "@/lib/data/articles";
import ReadingProgress from "@/components/article/ReadingProgress";
import RichTextRenderer from "@/components/editor/RichTextRenderer";

interface Props {
  params: Promise<{ slug: string }>;
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} — Anugerah Ventures`,
      description: article.excerpt,
      type: "article",
      publishedTime: article.published_at,
      tags: article.tags,
      ...(article.cover_image_url && { images: [{ url: article.cover_image_url }] }),
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
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // ── JSON-LD Schema.org — BlogPosting ──────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.published_at,
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
    ...(article.cover_image_url && { image: article.cover_image_url }),
    keywords: article.tags.join(", "),
    inLanguage: "id-ID",
    articleSection: article.tags[0] ?? "Insights",
  };

  return (
    <>
      {/* JSON-LD */}
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

          {/* Cover image */}
          {article.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover_image_url}
              alt={article.title}
              style={{
                width: "100%",
                maxHeight: "420px",
                objectFit: "cover",
                borderRadius: "2px",
                marginBottom: "2rem",
              }}
            />
          )}

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

          {/* Meta */}
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <time
              dateTime={article.published_at}
              style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.12em", color: "var(--color-text-subtle)" }}
            >
              {formatDate(article.published_at)}
            </time>
            <span style={{ color: "var(--color-text-subtle)", fontSize: "0.7rem" }}>·</span>
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.12em", color: "var(--color-text-subtle)" }}>
              {article.reading_time || 0} menit baca
            </span>
          </div>
        </header>

        {/* ── ARTICLE BODY ─────────────────────────────────── */}
        <article
          id="article-body"
          style={{
            maxWidth: "65ch",
            margin: "0 auto",
            padding: "clamp(3rem, 7vh, 5rem) clamp(1.5rem, 4vw, 2rem)",
          }}
        >
          {/* RichTextRenderer: TipTap JSON → HTML, zero client JS */}
          <RichTextRenderer content={article.content_json} className="prose-av" />
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
