"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import GalleryDropzone from "@/components/admin/GalleryDropzone";
import RoleManager from "@/components/admin/RoleManager";
import ProjectAiCopilot from "@/components/admin/ProjectAiCopilot";
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
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    // Parse tech_stack from comma-separated to array
    const techStackArray = form.tech_stack
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const payload = { 
      ...form, 
      year: Number(form.year),
      tech_stack: techStackArray,
      hero_image_url: finalHeroUrl || null, 
      gallery_urls: finalGalleryUrls 
    };

    const parsed = projectSchema.safeParse(payload);
    if (!parsed.success) {
      const msgs = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
      setError(msgs.join(" | "));
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("projects").insert({
        ...parsed.data,
        sort_order: 0,
      });

      if (error) throw error;
      router.push("/admin/projects");
    } catch (err: any) {
      setError(err.message || "Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", color: "var(--color-text)" }}>
      <AdminNav />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>New</p>
          <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Add Project
          </h1>
        </div>

        <ProjectAiCopilot onAccept={handleAiAccept} />

        {error && <div style={{ color: "red", marginBottom: "1rem", fontSize: "0.8rem" }}>{error}</div>}

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
                <RoleManager 
                  value={form.role}
                  onChange={(val) => updateForm("role", val)}
                />
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: 0 }}>
                <label htmlFor="slug" style={labelStyle}>Slug</label>
                <input id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} style={inputStyle} required placeholder="enterprise-resource-system" />
              </div>

              <div style={{ marginBottom: 0 }}>
                <label htmlFor="year" style={labelStyle}>Year</label>
                <input id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} style={inputStyle} min="2000" max="2099" />
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

            {/* Hero Image upload */}
            <div style={{ ...fieldStyle, background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.5rem", borderRadius: "2px" }}>
              <p style={{ ...labelStyle, marginBottom: "1rem" }}>Hero Image (→ R2 AVIF/MP4)</p>
              <input id="hero-image" type="file" accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-subtle)", marginBottom: "1rem", display: "block", maxWidth: "100%" }} />
              {heroImageUrl && (
                <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)", marginTop: "0.75rem", wordBreak: "break-all" }}>
                  ✓ {heroImageUrl.split("/").pop()}
                </p>
              )}
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
            
            <button type="submit" id="submit-project" disabled={loading} style={{ padding: "0.85rem 2rem", background: "rgba(192,192,192,0.1)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "2px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, width: "100%", marginBottom: "4rem" }}>
              {loading ? "Saving…" : "Save Project"}
            </button>
          </div>

          {/* RIGHT COLUMN (4 cols) - Live Preview Card */}
          <div style={{ gridColumn: "span 4 / span 4", position: "sticky", top: "calc(var(--nav-height, 64px) + 2rem)", alignSelf: "start" }}>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.8rem", textAlign: "right" }}>Live Preview</p>
            <div style={{
              width: "100%",
              aspectRatio: "3/4",
              background: "var(--color-surface)",
              border: "1px solid rgba(192, 192, 192, 0.2)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}>
              
              {/* Media Container */}
              <div style={{ height: "45%", width: "100%", position: "relative", background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(192,192,192,0.1)" }}>
                {imageFile ? (
                  imageFile.type.startsWith("video/") ? (
                    <video 
                      src={URL.createObjectURL(imageFile)} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={URL.createObjectURL(imageFile)} alt="Hero Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )
                ) : heroImageUrl ? (
                  (heroImageUrl.toLowerCase().endsWith(".mp4") || heroImageUrl.toLowerCase().endsWith(".webm")) ? (
                    <video 
                      src={heroImageUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={heroImageUrl} alt="Hero Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-subtle)" }}>
                    No Hero Media
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-silver)" }}>
                    {form.role || "Role"}
                  </span>
                  <span style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", color: "var(--color-text-subtle)", fontStyle: "italic" }}>
                    {form.year || "Year"}
                  </span>
                </div>

                <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "1.1rem", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.25, color: "var(--color-text)", marginBottom: "0.75rem" }}>
                  {form.title || "Project Title"}
                </h3>

                <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", fontWeight: 300, lineHeight: 1.6, color: "var(--color-text-muted)", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {form.description || "Description preview..."}
                </p>

                <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", listStyle: "none", margin: 0, padding: 0, marginTop: "1rem" }}>
                  {form.tech_stack ? form.tech_stack.split(",").slice(0, 3).map((tag, i) => (
                    <li key={i} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192, 192, 192, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "2px" }}>
                      {tag.trim()}
                    </li>
                  )) : (
                    <li style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192, 192, 192, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "2px" }}>
                      TECH STACK
                    </li>
                  )}
                  {form.tech_stack.split(",").length > 3 && (
                     <li style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192, 192, 192, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "2px" }}>
                     +{form.tech_stack.split(",").length - 3}
                   </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
