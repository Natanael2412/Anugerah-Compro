import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug } from "@/lib/data/articles";
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

  if (!article || !article.is_av_published) notFound();

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
    keywords: article.tags?.join(", "),
    inLanguage: "id-ID",
    articleSection: article.tags?.[0] ?? "Insights",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress articleId="article-body" />

      <div style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
        
        {/* ── HIGH-END EDITORIAL HERO SECTION ── */}
        <section className="relative w-full h-[70vh] flex items-end">
          {/* Cover Image Background */}
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              className="object-cover z-0"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[#0c1f20] z-0" />
          )}

          {/* Gradient Scrim */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#051011] via-[#051011]/60 to-transparent pointer-events-none" />

          {/* Overlay Content */}
          <div className="relative z-20 w-full p-8 md:p-12 max-w-5xl">
            {/* Breadcrumb Back Link */}
            <Link
              href="/"
              className="group inline-flex items-center text-xs font-helvetica tracking-[0.2em] uppercase text-silver hover:text-white transition-colors mb-6"
            >
              <span className="mr-2 opacity-50 group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span className="relative">
                Back to Studio
                <span className="absolute left-0 bottom-[-4px] w-0 h-[1px] bg-silver transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>

            {/* Title */}
            <h1 className="font-helvetica font-light text-[#F8F9FA] text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-6">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-helvetica tracking-[0.1em] uppercase text-silver/70">
              <span>Anugerah Ventures</span>
              <span>·</span>
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              <span>·</span>
              <span>{article.reading_time || 0} MIN READ</span>
            </div>
          </div>
        </section>

        {/* ── CONTENT SECTION (BELOW THE FOLD) ── */}
        <section className="w-full bg-[#051011]">
          <article
            id="article-body"
            className="max-w-3xl mx-auto py-16 px-6 md:px-4"
          >
            <RichTextRenderer
              content={article.content_json}
              className="prose prose-invert prose-lg max-w-none text-[#F8F9FA] prose-headings:font-helvetica prose-headings:text-white prose-headings:font-light prose-a:text-silver hover:prose-a:text-white prose-a:transition-colors prose-img:rounded-lg prose-img:mx-auto prose-img:shadow-xl prose-hr:border-silver/10 prose-blockquote:border-silver prose-blockquote:text-silver/80"
            />
          </article>
        </section>

      </div>
    </>
  );
}
