"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNav from "@/components/admin/AdminNav";
import { useToast } from "@/components/ui/ToastProvider";
import type { TiptapDoc } from "@/lib/data/articles";
import { updateArticle } from "@/lib/actions";
import ArticleImageUpload from "@/components/admin/ArticleImageUpload";
import AiCoPilot from "@/components/admin/AiCoPilot";
import type { RichTextEditorRef } from "@/components/editor/RichTextEditor";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div style={{ border: "1px solid rgba(192,192,192,0.12)", borderRadius: "2px", background: "rgba(255,255,255,0.02)", minHeight: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--color-text-subtle)", textTransform: "uppercase" }}>Loading editor…</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(192,192,192,0.12)", borderRadius: "2px", padding: "0.75rem 1rem", fontFamily: "var(--font-helvetica)", fontSize: "0.9rem", color: "var(--color-text)", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-subtle)", display: "block", marginBottom: "0.5rem",
};

const fieldStyle: React.CSSProperties = { marginBottom: "1.5rem" };

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().max(160, "Excerpt must be 160 characters or less").optional().default(""),
  tags: z.string().optional().default(""),
  readingTime: z.string().default("5"),
  publishedAt: z.string().optional(),
  is_av_published: z.boolean().default(false),
  is_personal_published: z.boolean().default(false),
  cover_image_url: z.string().optional().default(""),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tags?: string[] | null;
  reading_time?: number | null;
  published_at?: string | null;
  is_av_published?: boolean | null;
  is_personal_published?: boolean | null;
  content_json: TiptapDoc;
  cover_image_url?: string | null;
}

export default function EditArticleForm({ article }: { article: ArticleData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentJson, setContentJson] = useState<TiptapDoc>(article.content_json || {});
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<RichTextEditorRef>(null);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      tags: (article.tags || []).join(", "),
      readingTime: String(article.reading_time || 5),
      publishedAt: article.published_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      is_av_published: article.is_av_published || false,
      is_personal_published: article.is_personal_published || false,
      cover_image_url: article.cover_image_url || "",
    }
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val, { shouldValidate: true });
    // Note: Auto-slug is typically not forced on edit, but we can update it if it's currently empty
  };

  const handleEditorChange = useCallback((json: TiptapDoc) => {
    setContentJson(json);
    const text = JSON.stringify(json).replace(/"text":"([^"]+)"/g, "$1");
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setWordCount(words);
    setValue("readingTime", String(minutes));
  }, [setValue]);

  const handleAiSuccess = useCallback((data: { title: string; excerpt: string; tags: string; contentHtml: string }) => {
    setValue("title", data.title, { shouldValidate: true });
    setValue("excerpt", data.excerpt, { shouldValidate: true });
    setValue("tags", data.tags, { shouldValidate: true });
    
    // Attempt auto-slug if empty
    const currentSlug = watch("slug");
    if (!currentSlug) {
      const generatedSlug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }

    if (editorRef.current) {
      editorRef.current.setContent(data.contentHtml);
    }
  }, [setValue, watch]);

  async function onSubmit(data: ArticleFormValues) {
    setLoading(true);
    try {
      await updateArticle(article.id, {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content_json: contentJson,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        reading_time: Number(data.readingTime),
        published_at: data.publishedAt || null,
        is_av_published: data.is_av_published,
        is_personal_published: data.is_personal_published,
        cover_image_url: data.cover_image_url || null,
      });
      showToast("Artikel berhasil disimpan!", "success");
      router.refresh();
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

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>Edit</p>
            <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>{article.title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", color: "var(--color-text-subtle)", letterSpacing: "0.08em" }}>~{watch("readingTime")} min read · {wordCount} words</span>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer" }}
            >
              ← Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2.5rem" }}>
          
          {/* LEFT COLUMN */}
          <div style={{ gridColumn: "span 8" }}>
            <AiCoPilot onGenerateSuccess={handleAiSuccess} />

            <div style={fieldStyle}>
              <label htmlFor="art-title" style={labelStyle}>Title</label>
              <input id="art-title" type="text" {...register("title")} onChange={handleTitleChange} style={{ ...inputStyle, fontSize: "1.5rem", padding: "1rem" }} placeholder="Type your title here..." />
              {errors.title && <span style={{ color: "red", fontSize: "0.75rem" }}>{errors.title.message}</span>}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Content</label>
              <RichTextEditor ref={editorRef} value={contentJson} onChange={handleEditorChange} uploadFolder="articles/content" placeholder="Start writing your article..." minHeight="600px" />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ gridColumn: "span 4" }}>
            <div style={{ position: "sticky", top: "calc(var(--nav-height, 64px) + 2rem)" }}>
              
              <div style={fieldStyle}>
                <label style={labelStyle}>Cover Image</label>
                <Controller
                  name="cover_image_url"
                  control={control}
                  render={({ field }) => (
                    <ArticleImageUpload value={field.value || ""} onChange={field.onChange} folder="articles/covers" />
                  )}
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="art-slug" style={labelStyle}>Slug</label>
                <input id="art-slug" type="text" {...register("slug")} style={inputStyle} placeholder="judul-artikel" />
                {errors.slug && <span style={{ color: "red", fontSize: "0.75rem" }}>{errors.slug.message}</span>}
              </div>

              <div style={fieldStyle}>
                <label htmlFor="art-excerpt" style={labelStyle}>Excerpt</label>
                <textarea id="art-excerpt" {...register("excerpt")} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Brief summary (max 160 chars)" />
                {errors.excerpt && <span style={{ color: "red", fontSize: "0.75rem" }}>{errors.excerpt.message}</span>}
              </div>

              <div style={fieldStyle}>
                <label htmlFor="art-tags" style={labelStyle}>Tags (comma-separated)</label>
                <input id="art-tags" type="text" {...register("tags")} style={inputStyle} placeholder="Leadership, Engineering" />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="art-date" style={labelStyle}>Publish Date</label>
                <input id="art-date" type="date" {...register("publishedAt")} style={inputStyle} />
              </div>

              <div style={{ padding: "1.5rem", background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", borderRadius: "2px", marginBottom: "2rem" }}>
                <h3 style={{ ...labelStyle, marginBottom: "1rem" }}>Distribution</h3>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <input id="art-publish-av" type="checkbox" {...register("is_av_published")} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
                  <label htmlFor="art-publish-av" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
                    Publish to Anugerah Ventures
                  </label>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input id="art-publish-personal" type="checkbox" {...register("is_personal_published")} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
                  <label htmlFor="art-publish-personal" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
                    Publish to Personal Portfolio
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "1rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
