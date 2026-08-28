"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNav from "@/components/admin/AdminNav";
import { useToast } from "@/components/ui/ToastProvider";
import type { TiptapDoc } from "@/lib/data/articles";
import { updateArticle } from "@/lib/actions";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div style={{ border: "1px solid rgba(192,192,192,0.12)", borderRadius: "2px", background: "rgba(255,255,255,0.02)", minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--color-text-subtle)", textTransform: "uppercase" }}>
        Loading editor…
      </span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(192,192,192,0.12)",
  borderRadius: "2px", padding: "0.75rem 1rem", fontFamily: "var(--font-helvetica)",
  fontSize: "0.9rem", color: "var(--color-text)", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--color-text-subtle)", display: "block", marginBottom: "0.5rem",
};
const fieldStyle: React.CSSProperties = { marginBottom: "1.5rem" };

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  reading_time: number;
  published_at: string;
  is_av_published: boolean;
  content_json: TiptapDoc;
}

export default function EditArticleForm({ article }: { article: ArticleData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentJson, setContentJson] = useState<TiptapDoc>(article.content_json || {});
  const [form, setForm] = useState({
    title: article.title || "",
    slug: article.slug || "",
    excerpt: article.excerpt || "",
    tags: (article.tags || []).join(", "),
    readingTime: String(article.reading_time || 5),
    publishedAt: article.published_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    is_av_published: article.is_av_published || false,
  });

  function updateForm(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleEditorChange = useCallback((json: TiptapDoc) => {
    setContentJson(json);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug) { showToast("Title dan slug wajib diisi.", "error"); return; }
    setLoading(true);
    try {
      await updateArticle(article.id, {
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt,
        content_json: contentJson,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        reading_time: Number(form.readingTime),
        published_at: form.publishedAt || null,
        is_av_published: form.is_av_published,
      });
      showToast("Artikel berhasil disimpan!", "success");
    } catch (err) {
      console.error("[EditArticle] Error:", err);
      showToast("Gagal menyimpan artikel.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>Edit</p>
            <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              {article.title}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer" }}
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="art-title" style={labelStyle}>Title</label>
            <input id="art-title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="art-slug" style={labelStyle}>Slug</label>
            <input id="art-slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="art-excerpt" style={labelStyle}>Excerpt</label>
            <textarea id="art-excerpt" value={form.excerpt} onChange={(e) => updateForm("excerpt", e.target.value)} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Content</label>
            <RichTextEditor value={contentJson} onChange={handleEditorChange} uploadFolder="articles/content" minHeight="480px" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label htmlFor="art-tags" style={labelStyle}>Tags (comma-separated)</label>
              <input id="art-tags" type="text" value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="art-date" style={labelStyle}>Publish Date</label>
              <input id="art-date" type="date" value={form.publishedAt} onChange={(e) => updateForm("publishedAt", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "1rem", background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", borderRadius: "2px" }}>
            <input id="art-publish" type="checkbox" checked={form.is_av_published} onChange={(e) => updateForm("is_av_published", e.target.checked)} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
            <label htmlFor="art-publish" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
              Publish to Anugerah Ventures
            </label>
          </div>
          <button type="submit" id="submit-edit-article" disabled={loading} style={{ padding: "0.85rem 2rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
