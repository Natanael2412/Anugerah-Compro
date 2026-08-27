"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

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

const fieldStyle: React.CSSProperties = {
  marginBottom: "1.5rem",
};

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
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
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      }));
    }
  }

  /** Estimate reading time: ~200 words/min */
  function estimateReadingTime(md: string) {
    const wordCount = md.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  function handleContentChange(value: string) {
    setForm((prev) => ({
      ...prev,
      content_md: value,
      readingTime: String(estimateReadingTime(value)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Phase 4: Insert into Supabase
    // const supabase = createClient()
    // await supabase.from("articles").insert({
    //   slug: form.slug, title: form.title, excerpt: form.excerpt,
    //   content_md: form.content_md, tags: form.tags.split(",").map(t => t.trim()),
    //   reading_time: Number(form.readingTime), published_at: form.publishedAt,
    //   is_av_published: form.is_av_published,
    // })
    console.log("Article data (Phase 4: save to Supabase):", form);

    alert("Phase 4: Connect Supabase untuk menyimpan artikel. Data sudah di-log ke console.");
    setLoading(false);
    router.push("/admin/articles");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding:
            "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem",
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

          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            id="toggle-preview"
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: previewMode ? "var(--color-silver)" : "var(--color-text-subtle)",
              background: "none",
              border: "1px solid rgba(192,192,192,0.15)",
              padding: "0.5rem 1rem",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            {previewMode ? "← Edit" : "Preview →"}
          </button>
        </div>

        {previewMode ? (
          /* ── Markdown Preview ─────────────────────────── */
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(192,192,192,0.08)",
              borderRadius: "2px",
              padding: "2.5rem",
              minHeight: "400px",
            }}
          >
            {form.title && (
              <h1
                style={{
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 300,
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                  marginBottom: "1.5rem",
                }}
              >
                {form.title}
              </h1>
            )}
            <div className="prose-av">
              {/* Simple line-based preview — full MDX render happens at runtime */}
              {form.content_md ? (
                form.content_md.split("\n").map((line, i) => {
                  if (line.startsWith("## "))
                    return (
                      <h2 key={i} style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>
                        {line.replace("## ", "")}
                      </h2>
                    );
                  if (line.startsWith("### "))
                    return (
                      <h3 key={i} style={{ marginTop: "1.75rem", marginBottom: "0.75rem" }}>
                        {line.replace("### ", "")}
                      </h3>
                    );
                  if (line.startsWith("> "))
                    return (
                      <blockquote key={i}>
                        {line.replace("> ", "")}
                      </blockquote>
                    );
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })
              ) : (
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontStyle: "italic",
                  }}
                >
                  Tulis artikel di tab Edit untuk melihat preview...
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ── Edit Form ────────────────────────────────── */
          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label htmlFor="art-title" style={labelStyle}>
                Title
              </label>
              <input
                id="art-title"
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                style={inputStyle}
                required
                placeholder="Judul artikel..."
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="art-slug" style={labelStyle}>
                Slug
              </label>
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

            <div style={fieldStyle}>
              <label htmlFor="art-excerpt" style={labelStyle}>
                Excerpt
              </label>
              <textarea
                id="art-excerpt"
                value={form.excerpt}
                onChange={(e) => updateForm("excerpt", e.target.value)}
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                placeholder="Ringkasan singkat artikel (ditampilkan di listing)..."
              />
            </div>

            <div style={fieldStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <label htmlFor="art-content" style={{ ...labelStyle, marginBottom: 0 }}>
                  Content (Markdown)
                </label>
                <span
                  style={{
                    fontFamily: "var(--font-helvetica)",
                    fontSize: "0.62rem",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  ~{form.readingTime} min read
                </span>
              </div>
              <textarea
                id="art-content"
                value={form.content_md}
                onChange={(e) => handleContentChange(e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: "380px",
                  resize: "vertical",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                }}
                placeholder={`## Subheading\n\nTulis artikel dalam format Markdown...\n\n> Blockquote\n\n**Bold** dan *italic* didukung.`}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <label htmlFor="art-tags" style={labelStyle}>
                  Tags (comma-separated)
                </label>
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
                <label htmlFor="art-date" style={labelStyle}>
                  Publish Date
                </label>
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
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : "Save Article"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
