"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import RoleManager from "@/components/admin/RoleManager";
import ProjectAiCopilot from "@/components/admin/ProjectAiCopilot";
import { useToast } from "@/components/ui/ToastProvider";
import { projectSchema } from "@/lib/data/projectSchema";
import { updateProject } from "@/lib/actions";
import type { Project } from "@/lib/data/projectSchema";
import { X, ChevronDown, Trash2, Star, Image as ImageIcon, Video as VideoIcon, UploadCloud } from "lucide-react";

export default function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const { showToast } = useToast();
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Media States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url || "");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(project.gallery_urls || []);

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
    is_av_featured: project.is_av_featured || false,
    is_personal_featured: project.is_personal_featured || false,
    project_status: project.project_status || "public",
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
    // If the file is a video, use the presigned URL flow to bypass Vercel payload limits
    if (file.type.startsWith("video/")) {
      try {
        const ticketRes = await fetch("/api/upload-video-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, filetype: file.type, folder }),
        });
        
        if (!ticketRes.ok) {
          const errData = await ticketRes.json().catch(() => ({}));
          throw new Error(`Failed to get upload ticket (${ticketRes.status}): ${errData.error || file.name}`);
        }
        
        const { presignedUrl, publicUrl } = await ticketRes.json();
        
        // Upload directly to Cloudflare R2
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        
        if (!uploadRes.ok) {
          throw new Error(`Direct upload failed (${uploadRes.status}): ${uploadRes.statusText}`);
        }
        
        return publicUrl;
      } catch (directErr: any) {
        console.warn("Direct R2 upload failed (e.g. CORS on current port/origin), attempting server fallback...", directErr);
        // Graceful fallback to server route (succeeds on localhost or if within server payload limit)
        const fallbackFormData = new FormData();
        fallbackFormData.append("file", file);
        fallbackFormData.append("folder", folder);
        const fallbackRes = await fetch("/api/upload-image", { method: "POST", body: fallbackFormData });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          return fallbackData.url;
        }

        throw new Error(
          `Direct upload failed (${directErr.message}). Server fallback also failed (${fallbackRes.status}). Pastikan CORS R2 mengizinkan origin ${typeof window !== "undefined" ? window.location.origin : ""}.`
        );
      }
    }

    // Default flow for images (goes through Vercel for compression)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/upload-image", { method: "POST", body: formData });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Upload failed (${res.status}): ${errData.error || file.name}`);
    }
    const data = await res.json();
    return data.url;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const techStackArray = form.tech_stack
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    setLoading(true);
    setError(null);

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
      showToast(`Gagal menyimpan proyek: ${err instanceof Error ? err.message : String(err)}`, "error");
    } finally {
      setLoading(false);
    }
  }

  // ---- MEDIA MANAGEMENT LOGIC ----
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length > 0) {
      if (!heroImageUrl && !imageFile && galleryFiles.length === 0 && galleryUrls.length === 0) {
        setImageFile(files[0]);
        setGalleryFiles(prev => [...prev, ...files.slice(1)]);
      } else {
        setGalleryFiles(prev => [...prev, ...files]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (!heroImageUrl && !imageFile && galleryFiles.length === 0 && galleryUrls.length === 0) {
        setImageFile(files[0]);
        setGalleryFiles(prev => [...prev, ...files.slice(1)]);
      } else {
        setGalleryFiles(prev => [...prev, ...files]);
      }
    }
  };

  const makeHeroUrl = (url: string) => {
    const oldHeroUrl = heroImageUrl;
    const oldHeroFile = imageFile;
    setHeroImageUrl(url);
    setImageFile(null);
    setGalleryUrls(prev => prev.filter(u => u !== url));
    
    if (oldHeroUrl) setGalleryUrls(prev => [...prev, oldHeroUrl]);
    if (oldHeroFile) setGalleryFiles(prev => [...prev, oldHeroFile]);
  };

  const makeHeroFile = (file: File) => {
    const oldHeroUrl = heroImageUrl;
    const oldHeroFile = imageFile;
    setImageFile(file);
    setHeroImageUrl("");
    setGalleryFiles(prev => prev.filter(f => f !== file));
    
    if (oldHeroUrl) setGalleryUrls(prev => [...prev, oldHeroUrl]);
    if (oldHeroFile) setGalleryFiles(prev => [...prev, oldHeroFile]);
  };

  const deleteUrl = (url: string) => {
    if (url === heroImageUrl) setHeroImageUrl("");
    else setGalleryUrls(prev => prev.filter(u => u !== url));
  };

  const deleteFile = (file: File) => {
    if (file === imageFile) setImageFile(null);
    else setGalleryFiles(prev => prev.filter(f => f !== file));
  };

  const isVideo = (urlOrFile: string | File) => {
    if (typeof urlOrFile === "string") {
      return urlOrFile.toLowerCase().endsWith(".mp4") || urlOrFile.toLowerCase().endsWith(".webm");
    }
    return urlOrFile.type.startsWith("video/");
  };

  const getPreviewUrl = (urlOrFile: string | File) => {
    if (typeof urlOrFile === "string") return urlOrFile;
    return URL.createObjectURL(urlOrFile);
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    if (isMediaModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMediaModalOpen]);

  // Combined Media Array for Grid
  const allMedia: { source: 'hero' | 'gallery', type: 'url' | 'file', item: string | File, preview: string, isVideo: boolean }[] = [];
  
  if (imageFile) allMedia.push({ source: 'hero', type: 'file', item: imageFile, preview: getPreviewUrl(imageFile), isVideo: isVideo(imageFile) });
  else if (heroImageUrl) allMedia.push({ source: 'hero', type: 'url', item: heroImageUrl, preview: getPreviewUrl(heroImageUrl), isVideo: isVideo(heroImageUrl) });

  galleryUrls.forEach(url => allMedia.push({ source: 'gallery', type: 'url', item: url, preview: getPreviewUrl(url), isVideo: isVideo(url) }));
  galleryFiles.forEach(f => allMedia.push({ source: 'gallery', type: 'file', item: f, preview: getPreviewUrl(f), isVideo: isVideo(f) }));


  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main style={{ marginLeft: "220px", paddingTop: "3rem", paddingBottom: "4rem" }} className="px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.25rem" }}>Edit</p>
            <h1 style={{ fontFamily: "var(--font-helvetica)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 300, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              {project.title}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer" }}
          >
            â† Back
          </button>
        </div>

        <ProjectAiCopilot onAccept={handleAiAccept} />

        {error && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "4px", color: "#f87171", fontFamily: "var(--font-helvetica)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT COLUMN (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label htmlFor="title" style={labelStyle}>Title</label>
              <input id="title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} required style={inputStyle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="client" style={labelStyle}>Client (Optional)</label>
                <input id="client" type="text" value={form.client} onChange={(e) => updateForm("client", e.target.value)} style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="role" style={labelStyle}>Role</label>
                <RoleManager value={form.role} onChange={(val) => updateForm("role", val)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="live_url" style={labelStyle}>Live URL (Optional)</label>
                <input id="live_url" type="url" value={form.live_url} onChange={(e) => updateForm("live_url", e.target.value)} style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="tech_stack" style={labelStyle}>Tech Stack (comma-separated)</label>
                <input id="tech_stack" type="text" value={form.tech_stack} onChange={(e) => updateForm("tech_stack", e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="slug" style={labelStyle}>Slug</label>
                <input id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} required style={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="year" style={labelStyle}>Year</label>
                <input id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} min="2000" max="2099" style={inputStyle} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" style={labelStyle}>Description</label>
              <textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} maxLength={500}
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} />
              <div style={{ textAlign: "right", fontSize: "0.7rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)", marginTop: "0.25rem" }}>
                {form.description.length} / 500
              </div>
            </div>

            {/* DISTRIBUTION & FEATURED TOGGLES */}
            <div style={{ background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.1)", padding: "1.5rem", borderRadius: "4px" }}>
              <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-text)", marginBottom: "1.25rem" }}>Distribution &amp; Featured</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ToggleRow id="is_av_published" label="Publish to Anugerah Ventures" checked={form.is_av_published} onChange={(c) => updateForm("is_av_published", c)} />
                <ToggleRow id="is_personal_published" label="Publish to Personal Site" checked={form.is_personal_published} onChange={(c) => updateForm("is_personal_published", c)} />
                <ToggleRow id="is_av_featured" label="Feature on AV Home" checked={form.is_av_featured} onChange={(c) => updateForm("is_av_featured", c)} />
                <ToggleRow id="is_personal_featured" label="Feature on Personal Home" checked={form.is_personal_featured} onChange={(c) => updateForm("is_personal_featured", c)} />
              </div>
            </div>

            {/* PROJECT STATUS */}
            <div style={{ background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.1)", padding: "1.5rem", borderRadius: "4px" }} className="flex flex-col gap-3">
              <label htmlFor="project_status" style={labelStyle}>Project Status (Access)</label>
              <div style={{ position: "relative" }}>
                <select
                  id="project_status"
                  value={form.project_status}
                  onChange={(e) => updateForm("project_status", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none", paddingRight: "2.5rem", cursor: "pointer" } as React.CSSProperties}
                >
                  <option value="public" style={{ background: "#111", color: "#fff" }}>🌍 Public (Boleh di-share)</option>
                  <option value="nda" style={{ background: "#111", color: "#fff" }}>🔒 NDA (Dokumentasi tertutup)</option>
                  <option value="concept" style={{ background: "#111", color: "#fff" }}>💡 Concept (Dummy, proprietary, dll)</option>
                </select>
                <div style={{ position: "absolute", top: 0, bottom: 0, right: "0.75rem", display: "flex", alignItems: "center", pointerEvents: "none", color: "var(--color-text-subtle)" }}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* MEDIA MANAGE BUTTON */}
            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                style={{ width: "100%", padding: "1rem", border: "1px dashed rgba(192,192,192,0.2)", borderRadius: "4px", background: "transparent", color: "var(--color-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", transition: "border-color 0.2s ease" }}
              >
                <ImageIcon size={18} />
                Manage Media &amp; Assets
                <span style={{ marginLeft: "0.5rem", padding: "0.1rem 0.5rem", borderRadius: "999px", background: "rgba(192,192,192,0.08)", fontSize: "0.72rem", color: "var(--color-text-subtle)" }}>
                  {allMedia.length} Items
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: "rgba(192,192,192,0.06)", border: "1px solid rgba(192,192,192,0.2)", borderRadius: "4px", fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, transition: "all 0.2s ease" }}
            >
              {loading ? "Savingâ€¦" : "Save Changes"}
            </button>
          </div>

          {/* RIGHT COLUMN (5 cols) - Live Preview */}
          <div className="lg:col-span-5 relative">
            <div style={{ position: "sticky", top: "2rem" }}>
              <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-text-subtle)", marginBottom: "0.75rem", textAlign: "right" }}>Live Preview</p>

              <div style={{ width: "100%", aspectRatio: "3/4", background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.1)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

                {/* STATUS BADGES OVERLAY */}
                <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10, display: "flex", gap: "0.5rem" }}>
                  {form.project_status === 'nda' && (
                    <span style={{ padding: "0.25rem 0.75rem", fontSize: "0.62rem", fontWeight: 500, color: "var(--color-text)", background: "rgba(0,0,0,0.8)", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-helvetica)" }}>
                      🔒 NDA Protected
                    </span>
                  )}
                  {form.project_status === 'concept' && (
                    <span style={{ padding: "0.25rem 0.75rem", fontSize: "0.62rem", fontWeight: 500, color: "#111", background: "rgba(255,255,255,0.9)", borderRadius: "999px", fontFamily: "var(--font-helvetica)" }}>
                      💡 Concept
                    </span>
                  )}
                </div>

                {/* Media Container */}
                <div style={{ height: "45%", width: "100%", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
                  {allMedia.length > 0 && allMedia[0].source === 'hero' ? (
                    allMedia[0].isVideo ? (
                      <div style={{ width: "100%", height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <VideoIcon size={32} style={{ color: "#333" }} />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={allMedia[0].preview} alt="Hero Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(192,192,192,0.2)" }}>
                      No Hero Media
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-subtle)" }}>
                      {form.role || "Role"}
                    </span>
                    <span style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", color: "var(--color-text-subtle)", fontStyle: "italic" }}>
                      {form.year || "Year"}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "1.1rem", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, color: "var(--color-text)", marginBottom: "0.75rem" }}>
                    {form.title || "Project Title"}
                  </h3>

                  <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", fontWeight: 300, lineHeight: 1.7, color: "var(--color-text-muted)", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                    {form.description || "Description preview..."}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "1rem" }}>
                    {form.tech_stack ? form.tech_stack.split(",").slice(0, 3).map((tag, i) => (
                      <span key={i} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.12)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                        {tag.trim()}
                      </span>
                    )) : (
                      <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)", border: "1px solid rgba(192,192,192,0.12)", padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                        TECH STACK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* MEDIA MANAGEMENT MODAL */}
      {isMediaModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", padding: "2rem" }}>
          <div style={{ background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.1)", borderRadius: "6px", width: "95vw", maxWidth: "1600px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid rgba(192,192,192,0.06)" }}>
              <h2 style={{ fontFamily: "var(--font-helvetica)", fontSize: "1rem", color: "var(--color-text)", fontWeight: 400, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ImageIcon size={18} style={{ color: "var(--color-text-subtle)" }} />
                Manage Media &amp; Assets
              </h2>
              <button onClick={() => setIsMediaModalOpen(false)} style={{ color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Dropzone */}
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", border: "2px dashed rgba(192,192,192,0.15)", borderRadius: "4px", cursor: "pointer", transition: "border-color 0.2s ease" }}
              >
                <UploadCloud size={30} style={{ color: "var(--color-text-subtle)", marginBottom: "0.75rem" }} />
                <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Click or drag media here to upload</p>
                <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.72rem", color: "var(--color-text-subtle)" }}>Supports JPG, PNG, WEBP, MP4, WEBM</p>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={handleFileSelect} style={{ display: "none" }} />
              </label>

              {/* Media Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                
                {/* Hero Media Section */}
                <div>
                  <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.85rem", color: "var(--color-text)", marginBottom: "1rem", borderBottom: "1px solid rgba(192,192,192,0.1)", paddingBottom: "0.5rem" }}>
                    Hero Media
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                    {allMedia.filter(m => m.source === 'hero').length === 0 ? (
                      <div style={{ gridColumn: "1/-1", padding: "2rem", border: "1px dashed rgba(192,192,192,0.2)", borderRadius: "4px", textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)" }}>
                        No hero media selected. Upload and make a media item hero.
                      </div>
                    ) : (
                      allMedia.filter(m => m.source === 'hero').map((media, idx) => (
                        <div key={idx} className="group" style={{ position: "relative", aspectRatio: "16/9", background: "#111", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(192,192,192,0.06)" }}>
                          {media.isVideo ? (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#333" }}>
                              <VideoIcon size={28} />
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={media.preview} alt="Media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          {/* Badges */}
                          <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", display: "flex", gap: "0.25rem" }}>
                            <span style={{ background: "rgba(37,99,235,0.9)", color: "white", fontSize: "0.55rem", fontFamily: "var(--font-helvetica)", fontWeight: 500, padding: "0.15rem 0.4rem", borderRadius: "2px", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Star size={9} fill="currentColor" /> Hero
                            </span>
                            {media.isVideo && (
                              <span style={{ background: "rgba(0,0,0,0.8)", color: "white", fontSize: "0.55rem", fontFamily: "var(--font-helvetica)", fontWeight: 500, padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                                Video
                              </span>
                            )}
                          </div>
                          {/* Hover Overlay */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => { if (media.type === 'url') deleteUrl(media.item as string); else deleteFile(media.item as File); }}
                              style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "none", borderRadius: "3px", padding: "0.35rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Gallery Media Section */}
                <div>
                  <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.85rem", color: "var(--color-text)", marginBottom: "1rem", borderBottom: "1px solid rgba(192,192,192,0.1)", paddingBottom: "0.5rem" }}>
                    Gallery Media
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                    {allMedia.filter(m => m.source !== 'hero').length === 0 ? (
                      <div style={{ gridColumn: "1/-1", padding: "2rem", border: "1px dashed rgba(192,192,192,0.2)", borderRadius: "4px", textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-helvetica)" }}>
                        No gallery items added yet.
                      </div>
                    ) : (
                      allMedia.filter(m => m.source !== 'hero').map((media, idx) => (
                        <div key={idx} className="group" style={{ position: "relative", aspectRatio: "16/9", background: "#111", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(192,192,192,0.06)" }}>
                          {media.isVideo ? (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", color: "#333" }}>
                              <VideoIcon size={28} />
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={media.preview} alt="Media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          {/* Badges */}
                          <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", display: "flex", gap: "0.25rem" }}>
                            {media.isVideo && (
                              <span style={{ background: "rgba(0,0,0,0.8)", color: "white", fontSize: "0.55rem", fontFamily: "var(--font-helvetica)", fontWeight: 500, padding: "0.15rem 0.4rem", borderRadius: "2px" }}>
                                Video
                              </span>
                            )}
                          </div>
                          {/* Hover Overlay */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => { if (media.type === 'url') makeHeroUrl(media.item as string); else makeHeroFile(media.item as File); }}
                              style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "3px", padding: "0.35rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}
                            >
                              <Star size={11} /> Make Hero
                            </button>
                            <button
                              type="button"
                              onClick={() => { if (media.type === 'url') deleteUrl(media.item as string); else deleteFile(media.item as File); }}
                              style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "none", borderRadius: "3px", padding: "0.35rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(192,192,192,0.06)", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                style={{ padding: "0.5rem 1.5rem", background: "rgba(192,192,192,0.08)", border: "1px solid rgba(192,192,192,0.15)", borderRadius: "3px", fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", cursor: "pointer" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared input styles
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(192,192,192,0.04)",
  border: "1px solid rgba(192,192,192,0.1)",
  borderRadius: "2px",
  padding: "0.75rem 1rem",
  fontFamily: "var(--font-helvetica)",
  fontSize: "0.875rem",
  color: "var(--color-text)",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-helvetica)",
  fontSize: "0.6rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--color-text-subtle)",
};

// Subcomponent for Custom Toggles
function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
      <label htmlFor={id} style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", cursor: "pointer", userSelect: "none", flex: 1 }}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          position: "relative",
          display: "inline-flex",
          height: "20px",
          width: "36px",
          cursor: "pointer",
          borderRadius: "999px",
          border: "2px solid transparent",
          transition: "background-color 0.2s ease",
          background: checked ? "var(--color-silver)" : "rgba(192,192,192,0.12)",
          outline: "none",
        }}
      >
        <span
          style={{
            pointerEvents: "none",
            display: "inline-block",
            height: "16px",
            width: "16px",
            borderRadius: "999px",
            background: checked ? "var(--color-surface)" : "rgba(192,192,192,0.4)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            transform: checked ? "translateX(16px)" : "translateX(0px)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}
