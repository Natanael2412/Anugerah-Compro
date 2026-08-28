"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNav from "@/components/admin/AdminNav";
import type { TiptapDoc } from "@/lib/data/articles";

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
        minHeight: "360px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--color-text-subtle)", textTransform: "uppercase" }}>
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

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [contentJson, setContentJson] = useState<TiptapDoc>({});
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    year: new Date().getFullYear().toString(),
    description: "",
    tags: "",
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
  }, []);

  async function handleImageUpload() {
    if (!imageFile) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("folder", "projects/hero");
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setHeroImageUrl(data.url);
      else throw new Error(data.error ?? "Upload failed");
    } catch (err) {
      console.error("Hero upload failed:", err);
      alert("Image upload failed. Check console.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug) { alert("Title and slug are required."); return; }
    setLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("projects").insert({
        slug: form.slug,
        title: form.title,
        category: form.category,
        year: Number(form.year),
        description: form.description,
        content_json: contentJson,
        hero_image_url: heroImageUrl || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_av_published: form.is_av_published,
        is_personal_published: false,
        sort_order: 0,
      });

      if (error) throw error;
      router.push("/admin/projects");
    } catch (err) {
      console.error("[NewProject] Save error:", err);
      alert("Failed to save project. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>New</p>
          <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Add Project
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="title" style={labelStyle}>Title</label>
            <input id="title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} style={inputStyle} required placeholder="Enterprise Resource System" />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="slug" style={labelStyle}>Slug</label>
            <input id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} style={inputStyle} required placeholder="enterprise-resource-system" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label htmlFor="category" style={labelStyle}>Category</label>
              <input id="category" type="text" value={form.category} onChange={(e) => updateForm("category", e.target.value)} style={inputStyle} placeholder="Product Architecture" />
            </div>
            <div>
              <label htmlFor="year" style={labelStyle}>Year</label>
              <input id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} style={inputStyle} min="2000" max="2099" />
            </div>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="description" style={labelStyle}>Short Description</label>
            <textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Brief project summary shown on listing…" />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="tags" style={labelStyle}>Tags (comma-separated)</label>
            <input id="tags" type="text" value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} style={inputStyle} placeholder="Architecture, TypeScript, PostgreSQL" />
          </div>

          {/* Hero Image upload */}
          <div style={{ ...fieldStyle, background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.5rem", borderRadius: "2px" }}>
            <p style={{ ...labelStyle, marginBottom: "1rem" }}>Hero Image (→ R2 AVIF)</p>
            <input id="hero-image" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-subtle)", marginBottom: "1rem", display: "block" }} />
            {imageFile && (
              <button type="button" onClick={handleImageUpload} disabled={imageUploading} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-silver)", background: "none", border: "1px solid rgba(192,192,192,0.2)", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer", opacity: imageUploading ? 0.6 : 1 }}>
                {imageUploading ? "Uploading…" : "Upload & Convert to AVIF"}
              </button>
            )}
            {heroImageUrl && (
              <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)", marginTop: "0.75rem" }}>
                ✓ {heroImageUrl.split("/").pop()}
              </p>
            )}
          </div>

          {/* Case Study — Rich Text Editor */}
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Case Study Content
              <span style={{ marginLeft: "0.75rem", fontWeight: 300, letterSpacing: 0, textTransform: "none", fontSize: "0.68rem", color: "rgba(192,192,192,0.4)" }}>
                — Insert images anywhere via toolbar
              </span>
            </label>
            <RichTextEditor
              value={contentJson}
              onChange={handleEditorChange}
              uploadFolder="projects/gallery"
              placeholder="Write the full case study here. Use toolbar for headings, blockquotes, and images…"
              minHeight="380px"
            />
          </div>

          {/* Publish toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "1rem", background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", borderRadius: "2px" }}>
            <input id="proj-publish" type="checkbox" checked={form.is_av_published} onChange={(e) => updateForm("is_av_published", e.target.checked)} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
            <label htmlFor="proj-publish" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
              Publish to Anugerah Ventures
            </label>
          </div>

          <button type="submit" id="submit-project" disabled={loading} style={{ padding: "0.85rem 2rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving…" : "Save Project"}
          </button>
        </form>
      </main>
    </div>
  );
}
