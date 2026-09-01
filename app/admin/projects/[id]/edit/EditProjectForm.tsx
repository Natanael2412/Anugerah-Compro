"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import GalleryDropzone from "@/components/admin/GalleryDropzone";
import RoleManager from "@/components/admin/RoleManager";
import ProjectAiCopilot from "@/components/admin/ProjectAiCopilot";
import { useToast } from "@/components/ui/ToastProvider";
import { projectSchema } from "@/lib/data/projectSchema";
import { updateProject } from "@/lib/actions";
import type { Project } from "@/lib/data/projectSchema";

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

export default function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url || "");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(project.gallery_urls || []);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: project.title || "",
    slug: project.slug || "",
    client: project.client || "",
    role: project.role || "",
    year: String(project.year || new Date().getFullYear()),
    description: project.description || "",
    tech_stack: (project.tech_stack || []).join(", "),
    live_url: project.live_url || "",
    is_av_published: project.is_av_published || false,
    is_personal_published: project.is_personal_published || false,
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

  const handleAiAccept = (data: any) => {
    setForm(prev => ({
      ...prev,
      title: data.title || prev.title,
      slug: data.slug || prev.slug,
      client: data.client || prev.client,
      role: data.role || prev.role,
      tech_stack: data.tech_stack ? data.tech_stack.join(", ") : prev.tech_stack,
      year: data.year ? String(data.year) : prev.year,
      description: data.description || prev.description,
    }));
  };

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/upload-image", { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
    const data = await res.json();
    return data.url;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Parse tech_stack from comma-separated to array
    const techStackArray = form.tech_stack
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    setLoading(true);
    setError(null);

    // First upload hero image if there is one
    let finalHeroUrl = heroImageUrl;
    if (imageFile) {
      try {
        finalHeroUrl = await uploadFile(imageFile, "projects/hero");
      } catch (err: any) {
        setError(`Hero image upload failed: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    // Then upload new gallery files
    const finalGalleryUrls = [...galleryUrls];
    for (let i = 0; i < galleryFiles.length; i++) {
      try {
        const url = await uploadFile(galleryFiles[i], "projects/gallery");
        finalGalleryUrls.push(url);
      } catch (err: any) {
        setError(`Gallery upload failed: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    // Validate using Zod schema
    const validationResult = projectSchema.safeParse({
      ...form,
      year: Number(form.year),
      tech_stack: techStackArray,
      hero_image_url: finalHeroUrl || null,
      gallery_urls: finalGalleryUrls,
    });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((err: any) => err.message).join(", ");
      setError(`Validation Error: ${errorMsg}`);
      setLoading(false);
      return;
    }

    try {
      await updateProject(project.id, validationResult.data);
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
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", fontFamily: "var(--font-helvetica)", letterSpacing: "-0.02em", marginBottom: "2rem" }}>
            Edit Project: {project.title}
          </h1>
          <button type="button" onClick={() => router.back()} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        <ProjectAiCopilot onAccept={handleAiAccept} />

        {error && <div style={{ color: "red", marginBottom: "1rem", fontSize: "0.8rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "2rem" }}>
          
          {/* LEFT COLUMN (8 cols) */}
          <div style={{ gridColumn: "span 8 / span 8" }}>
            <div style={fieldStyle}>
              <label htmlFor="title" style={labelStyle}>Title</label>
              <input id="title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} style={inputStyle} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label htmlFor="client" style={labelStyle}>Client (Optional)</label>
                <input id="client" type="text" value={form.client} onChange={(e) => updateForm("client", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="role" style={labelStyle}>Role</label>
                <RoleManager 
                  value={form.role}
                  onChange={(val) => updateForm("role", val)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label htmlFor="live_url" style={labelStyle}>Live URL (Optional)</label>
                <input id="live_url" type="url" value={form.live_url} onChange={(e) => updateForm("live_url", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="tech_stack" style={labelStyle}>Tech Stack (comma-separated)</label>
                <input id="tech_stack" type="text" value={form.tech_stack} onChange={(e) => updateForm("tech_stack", e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="description" style={labelStyle}>Description</label>
              <textarea 
                id="description" 
                value={form.description} 
                onChange={(e) => updateForm("description", e.target.value)} 
                maxLength={500}
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} 
                placeholder="Technical showcase summary (max 500 characters)..." 
              />
              <div style={{ textAlign: "right", fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "0.25rem", fontFamily: "var(--font-helvetica)" }}>
                {form.description.length} / 500
              </div>
            </div>

            <button type="submit" id="submit-edit-project" disabled={loading} style={{ marginTop: "1rem", padding: "0.85rem 2rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div style={{ gridColumn: "span 4 / span 4", position: "sticky", top: "calc(var(--nav-height, 64px) + 2rem)", alignSelf: "start" }}>
            <div style={fieldStyle}>
              <label htmlFor="slug" style={labelStyle}>Slug</label>
              <input id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} style={inputStyle} required />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="year" style={labelStyle}>Year</label>
              <input id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} style={inputStyle} min="2000" max="2099" />
            </div>

            {/* Hero Image */}
            <div style={{ ...fieldStyle, background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.5rem", borderRadius: "2px" }}>
              <p style={{ ...labelStyle, marginBottom: "0.5rem" }}>Hero Image</p>
              {heroImageUrl && (
                <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", color: "var(--color-silver)", marginBottom: "0.75rem", wordBreak: "break-all" }}>
                  Current: {heroImageUrl.split("/").pop()}
                </p>
              )}
              <input id="hero-image" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-subtle)", marginBottom: "1rem", display: "block", maxWidth: "100%" }} />
            </div>

            <div style={fieldStyle}>
              <GalleryDropzone onChange={(files, urls) => { setGalleryFiles(files); setGalleryUrls(urls); }} existingUrls={galleryUrls} />
            </div>

            {/* Publish toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem", padding: "1rem", background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", borderRadius: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input id="proj-publish-av" type="checkbox" checked={form.is_av_published} onChange={(e) => updateForm("is_av_published", e.target.checked)} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
                <label htmlFor="proj-publish-av" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
                  Publish to Anugerah Ventures
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input id="proj-publish-personal" type="checkbox" checked={form.is_personal_published} onChange={(e) => updateForm("is_personal_published", e.target.checked)} style={{ accentColor: "var(--color-silver)", width: "14px", height: "14px" }} />
                <label htmlFor="proj-publish-personal" style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", cursor: "pointer" }}>
                  Publish to Personal Site
                </label>
              </div>
            </div>
            
          </div>
        </form>
      </main>
    </div>
  );
}
