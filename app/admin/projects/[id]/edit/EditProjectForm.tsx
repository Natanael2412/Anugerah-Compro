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
      showToast("Gagal menyimpan proyek.", "error");
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
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <AdminNav />
      
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-8 pt-[calc(var(--nav-height,64px)+3rem)] pb-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="font-serif italic text-xs text-neutral-500 mb-1">Edit</p>
            <h1 className="font-sans text-2xl md:text-3xl font-light text-white tracking-tight">
              {project.title}
            </h1>
          </div>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="font-sans text-[0.65rem] tracking-[0.12em] uppercase text-neutral-500 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        <ProjectAiCopilot onAccept={handleAiAccept} />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Title</label>
              <input 
                id="title" type="text" value={form.title} onChange={(e) => updateForm("title", e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="client" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Client (Optional)</label>
                <input 
                  id="client" type="text" value={form.client} onChange={(e) => updateForm("client", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="role" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Role</label>
                <RoleManager value={form.role} onChange={(val) => updateForm("role", val)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="live_url" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Live URL (Optional)</label>
                <input 
                  id="live_url" type="url" value={form.live_url} onChange={(e) => updateForm("live_url", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="tech_stack" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Tech Stack (comma-separated)</label>
                <input 
                  id="tech_stack" type="text" value={form.tech_stack} onChange={(e) => updateForm("tech_stack", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="slug" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Slug</label>
                <input 
                  id="slug" type="text" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="year" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Year</label>
                <input 
                  id="year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} min="2000" max="2099"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Description</label>
              <textarea 
                id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} maxLength={500}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors min-h-[120px] resize-y"
              />
              <div className="text-right text-[0.7rem] text-neutral-500 font-sans mt-1">
                {form.description.length} / 500
              </div>
            </div>

            {/* DISTRIBUTION & FEATURED TOGGLES */}
            <div className="bg-[#111] border border-white/10 p-6 rounded-md">
              <h3 className="font-sans text-sm text-neutral-300 mb-5">Distribution & Featured</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <ToggleRow 
                  id="is_av_published" 
                  label="Publish to Anugerah Ventures" 
                  checked={form.is_av_published} 
                  onChange={(c) => updateForm("is_av_published", c)} 
                />
                <ToggleRow 
                  id="is_personal_published" 
                  label="Publish to Personal Site" 
                  checked={form.is_personal_published} 
                  onChange={(c) => updateForm("is_personal_published", c)} 
                />
                <ToggleRow 
                  id="is_av_featured" 
                  label="Feature on AV Home" 
                  checked={form.is_av_featured} 
                  onChange={(c) => updateForm("is_av_featured", c)} 
                />
                <ToggleRow 
                  id="is_personal_featured" 
                  label="Feature on Personal Home" 
                  checked={form.is_personal_featured} 
                  onChange={(c) => updateForm("is_personal_featured", c)} 
                />

              </div>
            </div>

            {/* PROJECT STATUS */}
            <div className="bg-[#111] border border-white/10 p-6 rounded-md flex flex-col gap-3">
              <label htmlFor="project_status" className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-500">Project Status (Access)</label>
              <div className="relative">
                <select 
                  id="project_status"
                  value={form.project_status}
                  onChange={(e) => updateForm("project_status", e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-white outline-none focus:border-white/30 transition-colors cursor-pointer pr-10"
                >
                  <option value="public" className="bg-[#111] text-white">🌍 Public (Live link displayed)</option>
                  <option value="nda" className="bg-[#111] text-white">🔒 NDA Protected (Live link hidden)</option>
                  <option value="concept" className="bg-[#111] text-white">💡 Concept Work (Live link hidden)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* MEDIA MANAGE BUTTON */}
            <div className="mt-4">
              <button 
                type="button" 
                onClick={() => setIsMediaModalOpen(true)}
                className="w-full py-4 border border-white/20 border-dashed rounded-md text-neutral-300 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-sans text-sm"
              >
                <ImageIcon size={18} />
                Manage Media & Assets
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs text-neutral-400">
                  {allMedia.length} Items
                </span>
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`mt-8 w-full py-4 bg-white/10 border border-white/20 rounded-md font-sans text-[0.7rem] tracking-[0.18em] uppercase text-white transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 cursor-pointer'}`}
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* RIGHT COLUMN (5 cols) - Live Preview */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-[calc(var(--nav-height,64px)+2rem)] w-full">
              <p className="font-serif text-[0.75rem] italic text-neutral-500 mb-3 text-right">Live Preview</p>
              
              <div className="w-full aspect-[3/4] bg-[#0a0a0a] border border-white/10 flex flex-col relative overflow-hidden group">
                
                {/* STATUS BADGES OVERLAY */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {form.project_status === 'nda' && (
                    <span className="px-3 py-1 text-[0.65rem] font-medium tracking-wide text-white bg-black/80 backdrop-blur-md rounded-full border border-white/10">
                      🔒 NDA Protected
                    </span>
                  )}
                  {form.project_status === 'concept' && (
                    <span className="px-3 py-1 text-[0.65rem] font-medium tracking-wide text-black bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                      💡 Concept
                    </span>
                  )}
                </div>

                {/* Media Container */}
                <div className="h-[45%] w-full relative bg-black/50 border-b border-white/5">
                  {allMedia.length > 0 && allMedia[0].source === 'hero' ? (
                    allMedia[0].isVideo ? (
                       <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                         <VideoIcon size={32} className="text-neutral-700" />
                       </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={allMedia[0].preview} alt="Hero Preview" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-sans text-[0.7rem] tracking-[0.1em] uppercase text-neutral-600">
                      No Hero Media
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-neutral-400">
                      {form.role || "Role"}
                    </span>
                    <span className="font-serif text-[0.75rem] text-neutral-500 italic">
                      {form.year || "Year"}
                    </span>
                  </div>

                  <h3 className="font-sans text-lg md:text-xl font-medium tracking-tight leading-tight text-white mb-3">
                    {form.title || "Project Title"}
                  </h3>

                  <p className="font-sans text-sm font-light leading-relaxed text-neutral-400 flex-1 line-clamp-3">
                    {form.description || "Description preview..."}
                  </p>

                  <ul className="flex flex-wrap gap-2 list-none m-0 p-0 mt-4">
                    {form.tech_stack ? form.tech_stack.split(",").slice(0, 3).map((tag, i) => (
                      <li key={i} className="font-sans text-[0.55rem] tracking-[0.15em] uppercase text-neutral-500 border border-white/10 px-2 py-1 rounded-sm">
                        {tag.trim()}
                      </li>
                    )) : (
                      <li className="font-sans text-[0.55rem] tracking-[0.15em] uppercase text-neutral-500 border border-white/10 px-2 py-1 rounded-sm">
                        TECH STACK
                      </li>
                    )}
                    {form.tech_stack.split(",").length > 3 && (
                       <li className="font-sans text-[0.55rem] tracking-[0.15em] uppercase text-neutral-500 border border-white/10 px-2 py-1 rounded-sm">
                       +{form.tech_stack.split(",").length - 3}
                     </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* MEDIA MANAGEMENT MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#111] border border-white/10 rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="font-sans text-lg text-white font-medium flex items-center gap-2">
                <ImageIcon size={20} className="text-neutral-400"/>
                Manage Media & Assets
              </h2>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-neutral-500 hover:text-white p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              
              {/* Dropzone Area */}
              <label 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/10 rounded-md hover:border-white/30 hover:bg-white/5 transition-all cursor-pointer"
              >
                <UploadCloud size={32} className="text-neutral-500 mb-3" />
                <p className="font-sans text-sm text-neutral-300 mb-1">Click or drag media here to upload</p>
                <p className="font-sans text-xs text-neutral-500">Supports JPG, PNG, WEBP, MP4, WEBM</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" 
                  onChange={handleFileSelect}
                  className="hidden" 
                />
              </label>

              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {allMedia.length === 0 ? (
                  <div className="col-span-full py-12 text-center font-sans text-sm text-neutral-600">
                    No media items added yet.
                  </div>
                ) : (
                  allMedia.map((media, idx) => (
                    <div key={idx} className="relative aspect-video bg-neutral-900 rounded-md overflow-hidden group border border-white/5">
                      
                      {/* PREVIEW */}
                      {media.isVideo ? (
                        <div className="w-full h-full flex items-center justify-center bg-black text-neutral-700">
                          <VideoIcon size={32} />
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={media.preview} alt="Media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}

                      {/* BADGES */}
                      <div className="absolute top-2 left-2 z-10 flex gap-1">
                        {media.source === 'hero' && (
                           <span className="bg-blue-600/90 text-white text-[0.55rem] font-medium px-2 py-0.5 rounded-sm backdrop-blur-sm flex items-center gap-1">
                             <Star size={10} fill="currentColor"/> Hero
                           </span>
                        )}
                        {media.isVideo && (
                           <span className="bg-black/80 text-white text-[0.55rem] font-medium px-2 py-0.5 rounded-sm backdrop-blur-sm">
                             Video
                           </span>
                        )}
                      </div>

                      {/* HOVER OVERLAY & ACTIONS */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
                         {media.source !== 'hero' && (
                           <button 
                             type="button"
                             onClick={() => {
                               if (media.type === 'url') makeHeroUrl(media.item as string);
                               else makeHeroFile(media.item as File);
                             }}
                             className="text-xs font-sans bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors"
                           >
                             <Star size={12}/> Make Hero
                           </button>
                         )}
                         
                         <button 
                           type="button"
                           onClick={() => {
                             if (media.type === 'url') deleteUrl(media.item as string);
                             else deleteFile(media.item as File);
                           }}
                           className="text-xs font-sans bg-red-500/20 hover:bg-red-500/40 text-red-100 px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors"
                         >
                           <Trash2 size={12}/> Delete
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end">
               <button 
                 type="button" 
                 onClick={() => setIsMediaModalOpen(false)}
                 className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-sans text-sm rounded-sm transition-colors"
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

// Subcomponent for Custom Toggles
function ToggleRow({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="font-sans text-[0.72rem] tracking-[0.12em] uppercase text-neutral-400 cursor-pointer select-none">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${checked ? 'bg-white' : 'bg-white/10'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#111] shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
