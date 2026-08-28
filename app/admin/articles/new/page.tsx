"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNav from "@/components/admin/AdminNav";
import type { TiptapDoc } from "@/lib/data/articles";

// Dynamically import the editor — TipTap requires DOM APIs
const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div
      style={{
        border: "1px solid rgba(192,192,192,0.12)",
        borderRadius: "2px",
        background: "rgba(255,255,255,0.02)",
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-helvetica)",
          fontSize: "0.72rem",
          letterSpacing: "0.12em",
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
        }}
      >
        Loading editor…
      </span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(192,192,192,0.12)",
  borderRadius: "2px",
  padding: "0.75rem 1rem",
  fontFamily: "var(--font-helvetica)",
  fontSize: "0.9rem",
  color: "var(--color-text)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-helvetica)",
  fontSize: "0.62rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--color-text-subtle)",
  display: "block",
  marginBottom: "0.5rem",
};

const fieldStyle: React.CSSProperties = { marginBottom: "1.5rem" };

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contentJson, setContentJson] = useState<TiptapDoc>({});
  const [wordCount, setWordCount] = useState(0);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    tags: "",
    readingTime: "5",
    publishedAt: new Date().toISOString().split("T")[0],
    is_av_published: false,
  });

  function updateForm(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "title" && typeof value === "string") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }));
    }
  }

  const handleEditorChange = useCallback((json: TiptapDoc) => {
    setContentJson(json);
    // Estimate word count from JSON
    const text = JSON.stringify(json).replace(/"text":"([^"]+)"/g, "$1");
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setWordCount(words);
    setForm((prev) => ({ ...prev, readingTime: String(minutes) }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      alert("Title and slug are required.");
      return;
    }
    setLoading(true);

    try {
      // ── Live Supabase insert ──────────────────────────────
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("articles").insert({
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt,
        content_json: contentJson,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        reading_time: Number(form.readingTime),
        published_at: form.publishedAt || null,
        is_av_published: form.is_av_published,
        is_personal_published: false,
      });

      if (error) throw error;
      router.push("/admin/articles");
    } catch (err) {
      console.error("[NewArticle] Save error:", err);
      alert("Failed to save article. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-citadel)",
                fontSize: "0.75rem",
                fontStyle: "italic",
                color: "var(--color-silver)",
                marginBottom: "0.4rem",
              }}
            >
              New
            </p>
            <h1
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                fontWeight: 300,
                color: "var(--color-text)",
                letterSpacing: "-0.01em",
              }}
            >
              Write Article
            </h1>
          </div>
          <span
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.62rem",
              color: "var(--color-text-subtle)",
              letterSpacing: "0.08em",
            }}
          >
            ~{form.readingTime} min read · {wordCount} words
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={fieldStyle}>
            <label htmlFor="art-title" style={labelStyle}>Title</label>
            <input
              id="art-title"
              type="text"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              style={inputStyle}
              required
              placeholder="Judul artikel…"
            />
          </div>

          {/* Slug */}
          <div style={fieldStyle}>
            <label htmlFor="art-slug" style={labelStyle}>Slug</label>
            <input
              id="art-slug"
              type="text"
              value={form.slug}
              onChange={(e) => updateForm("slug", e.target.value)}
              style={inputStyle}
              required
              placeholder="judul-artikel"
            />
          </div>

          {/* Excerpt */}
          <div style={fieldStyle}>
            <label htmlFor="art-excerpt" style={labelStyle}>Excerpt</label>
            <textarea
              id="art-excerpt"
              value={form.excerpt}
              onChange={(e) => updateForm("excerpt", e.target.value)}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              placeholder="Ringkasan singkat artikel (ditampilkan di listing)…"
            />
          </div>

          {/* Rich Text Editor */}
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Content
              <span
                style={{
                  marginLeft: "0.75rem",
                  fontWeight: 300,
                  letterSpacing: 0,
                  textTransform: "none",
                  fontSize: "0.68rem",
                  color: "rgba(192,192,192,0.4)",
                }}
              >
                — Insert images anywhere, add captions
              </span>
            </label>
            <RichTextEditor
              value={contentJson}
              onChange={handleEditorChange}
              uploadFolder="articles/content"
              placeholder="Tulis artikel di sini. Gunakan toolbar untuk heading, bold, blockquote, dan sisipkan gambar…"
              minHeight="480px"
            />
          </div>

          {/* Meta row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label htmlFor="art-tags" style={labelStyle}>Tags (comma-separated)</label>
              <input
                id="art-tags"
                type="text"
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                style={inputStyle}
                placeholder="Leadership, Engineering"
              />
            </div>
            <div>
              <label htmlFor="art-date" style={labelStyle}>Publish Date</label>
              <input
                id="art-date"
                type="date"
                value={form.publishedAt}
                onChange={(e) => updateForm("publishedAt", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Publish toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "2rem",
              padding: "1rem",
              background: "var(--color-surface)",
              border: "1px solid rgba(192,192,192,0.08)",
              borderRadius: "2px",
            }}
          >
            <input
              id="art-publish"
              type="checkbox"
              checked={form.is_av_published}
              onChange={(e) => updateForm("is_av_published", e.target.checked)}
              style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }}
            />
            <label
              htmlFor="art-publish"
              style={{
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                cursor: "pointer",
              }}
            >
              Publish to Anugerah Ventures
            </label>
          </div>

          <button
            type="submit"
            id="submit-article"
            disabled={loading}
            style={{
              padding: "0.85rem 2rem",
              background: "rgba(192,192,192,0.1)",
              border: "1px solid rgba(192,192,192,0.2)",
              borderRadius: "2px",
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-text)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Saving…" : "Save Article"}
          </button>
        </form>
      </main>
    </div>
  );
}
