"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNav from "@/components/admin/AdminNav";
import { useToast } from "@/components/ui/ToastProvider";
import type { TiptapDoc } from "@/lib/data/articles";
import { updateProject } from "@/lib/actions";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div style={{ border: "1px solid rgba(192,192,192,0.12)", borderRadius: "2px", background: "rgba(255,255,255,0.02)", minHeight: "360px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: number;
  description: string;
  tags: string[];
  is_av_published: boolean;
  hero_image_url?: string;
  content_json?: TiptapDoc;
}

export default function EditProjectForm({ project }: { project: ProjectData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url || "");
  const [contentJson, setContentJson] = useState<TiptapDoc>(project.content_json || {});
  const [form, setForm] = useState({
    title: project.title || "",
    slug: project.slug || "",
    category: project.category || "",
    year: String(project.year || new Date().getFullYear()),
    description: project.description || "",
    tags: (project.tags || []).join(", "),
    is_av_published: project.is_av_published || false,
  });

  function updateForm(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      if (data.url) { setHeroImageUrl(data.url); showToast("Gambar berhasil diupload!", "success"); }
      else throw new Error(data.error ?? "Upload failed");
    } catch (err) {
      console.error("Hero upload failed:", err);
      showToast("Upload gambar gagal.", "error");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug) { showToast("Title dan slug wajib diisi.", "error"); return; }
    setLoading(true);
    try {
      await updateProject(project.id, {
        slug: form.slug,
        title: form.title,
        category: form.category,
        year: Number(form.year),
        description: form.description,
        content_json: contentJson,
        hero_image_url: heroImageUrl || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_av_published: form.is_av_published,
      });
      showToast("Proyek berhasil disimpan!", "success");
    } catch (err) {
      console.error("[EditProject] Error:", err);
      showToast("Gagal menyimpan proyek.", "error");
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
              {project.title}
            </h1>
          </div>
          <button type="button" onClick={() => router.back()} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="title" style={labelStyle}>Title</label>
            <input id="title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="slug" style={labelStyle}>Slug</label>
            <input id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label htmlFor="category" style={labelStyle}>Category</label>
              <input id="category" type="text" value={form.category} onChange={(e) => updateForm("category", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="year" style={labelStyle}>Year</label>
              <input id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} style={inputStyle} min="2000" max="2099" />
            </div>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="description" style={labelStyle}>Short Description</label>
            <textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="tags" style={labelStyle}>Tags (comma-separated)</label>
            <input id="tags" type="text" value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} style={inputStyle} />
          </div>

          {/* Hero Image */}
          <div style={{ ...fieldStyle, background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.5rem", borderRadius: "2px" }}>
            <p style={{ ...labelStyle, marginBottom: "0.5rem" }}>Hero Image</p>
            {heroImageUrl && (
              <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", color: "var(--color-silver)", marginBottom: "0.75rem" }}>
                Current: {heroImageUrl.split("/").pop()}
              </p>
            )}
            <input id="hero-image" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-subtle)", marginBottom: "1rem", display: "block" }} />
            {imageFile && (
              <button type="button" onClick={handleImageUpload} disabled={imageUploading} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-silver)", background: "none", border: "1px solid rgba(192,192,192,0.2)", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer" }}>
                {imageUploading ? "Uploading…" : "Upload & Convert to AVIF"}
              </button>
            )}
          </div>

          {/* Content */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Case Study Content</label>
            <RichTextEditor value={contentJson} onChange={handleEditorChange} uploadFolder="projects/gallery" minHeight="380px" />
          </div>

          {/* Publish */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "1rem", background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", borderRadius: "2px" }}>
            <input id="proj-publish" type="checkbox" checked={form.is_av_published} onChange={(e) => updateForm("is_av_published", e.target.checked)} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
            <label htmlFor="proj-publish" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
              Publish to Anugerah Ventures
            </label>
          </div>

          <button type="submit" id="submit-edit-project" disabled={loading} style={{ padding: "0.85rem 2rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
