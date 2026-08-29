"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import GalleryDropzone from "@/components/admin/GalleryDropzone";
import { projectSchema } from "@/lib/data/projectSchema";

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
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    slug: "",
    client: "",
    role: "",
    year: new Date().getFullYear().toString(),
    description: "",
    tech_stack: "",
    live_url: "",
    is_av_published: false,
    is_personal_published: false,
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
    
    // Parse tech_stack from comma-separated to array
    const techStackArray = form.tech_stack
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    // Validate using Zod schema
    const validationResult = projectSchema.safeParse({
      ...form,
      year: Number(form.year),
      tech_stack: techStackArray,
      hero_image_url: heroImageUrl || null,
      gallery_urls: galleryUrls,
    });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((err: any) => err.message).join(", ");
      alert(`Validation Error: ${errorMsg}`);
      return;
    }

    setLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("projects").insert({
        ...validationResult.data,
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

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>New</p>
          <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Add Project
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "2rem" }}>
          
          {/* LEFT COLUMN (8 cols) */}
          <div style={{ gridColumn: "span 8 / span 8" }}>
            <div style={fieldStyle}>
              <label htmlFor="title" style={labelStyle}>Title</label>
              <input id="title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} style={inputStyle} required placeholder="Enterprise Resource System" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label htmlFor="client" style={labelStyle}>Client (Optional)</label>
                <input id="client" type="text" value={form.client} onChange={(e) => updateForm("client", e.target.value)} style={inputStyle} placeholder="Client Name" />
              </div>
              
              <div>
                <label htmlFor="role" style={labelStyle}>Role</label>
                <input 
                  id="role" 
                  list="role-options"
                  value={form.role} 
                  onChange={(e) => updateForm("role", e.target.value)} 
                  style={inputStyle} 
                  required 
                  placeholder="Select or type role..." 
                />
                <datalist id="role-options">
                  <option value="Product Manager" />
                  <option value="System Designer" />
                  <option value="Product Owner" />
                  <option value="Technical Architect" />
                  <option value="Lead Software Engineer" />
                  <option value="Engineering Manager" />
                  <option value="Creative Digital Architect" />
                  <option value="Lead Frontend Engineer" />
                  <option value="Interactive Web Engineer" />
                </datalist>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label htmlFor="live_url" style={labelStyle}>Live URL (Optional)</label>
                <input id="live_url" type="url" value={form.live_url} onChange={(e) => updateForm("live_url", e.target.value)} style={inputStyle} placeholder="https://..." />
              </div>
              <div>
                <label htmlFor="tech_stack" style={labelStyle}>Tech Stack (comma-separated)</label>
                <input id="tech_stack" type="text" value={form.tech_stack} onChange={(e) => updateForm("tech_stack", e.target.value)} style={inputStyle} placeholder="Next.js, TypeScript, Supabase" />
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
            
            <button type="submit" id="submit-project" disabled={loading} style={{ marginTop: "1rem", padding: "0.85rem 2rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Saving…" : "Save Project"}
            </button>
          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div style={{ gridColumn: "span 4 / span 4", position: "sticky", top: "calc(var(--nav-height, 64px) + 2rem)", alignSelf: "start" }}>
            <div style={fieldStyle}>
              <label htmlFor="slug" style={labelStyle}>Slug</label>
              <input id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} style={inputStyle} required placeholder="enterprise-resource-system" />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="year" style={labelStyle}>Year</label>
              <input id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} style={inputStyle} min="2000" max="2099" />
            </div>

            {/* Hero Image upload */}
            <div style={{ ...fieldStyle, background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.5rem", borderRadius: "2px" }}>
              <p style={{ ...labelStyle, marginBottom: "1rem" }}>Hero Image (→ R2 AVIF)</p>
              <input id="hero-image" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-subtle)", marginBottom: "1rem", display: "block", maxWidth: "100%" }} />
              {imageFile && (
                <button type="button" onClick={handleImageUpload} disabled={imageUploading} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-silver)", background: "none", border: "1px solid rgba(192,192,192,0.2)", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer", opacity: imageUploading ? 0.6 : 1 }}>
                  {imageUploading ? "Uploading…" : "Upload"}
                </button>
              )}
              {heroImageUrl && (
                <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)", marginTop: "0.75rem", wordBreak: "break-all" }}>
                  ✓ {heroImageUrl.split("/").pop()}
                </p>
              )}
            </div>

            <div style={fieldStyle}>
              <GalleryDropzone onUploadSuccess={(urls) => setGalleryUrls(urls)} existingUrls={galleryUrls} />
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
