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

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    year: new Date().getFullYear().toString(),
    description: "",
    tags: "",
  });

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Auto-generate slug from title
    if (key === "title") {
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

    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setHeroImageUrl(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Phase 4: Insert into Supabase
    // const supabase = createClient();
    // await supabase.from("projects").insert({ ...form, hero_image_url: heroImageUrl });
    console.log("Form data (Phase 4: save to Supabase):", { ...form, heroImageUrl });

    alert("Phase 4: Connect Supabase untuk menyimpan data. Form data sudah di-log ke console.");
    setLoading(false);
    router.push("/admin/projects");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-base)" }}>
      <AdminNav />

      <main style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "calc(var(--nav-height, 64px) + 3rem) clamp(1.5rem, 4vw, 3rem) 4rem",
      }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-citadel)", fontSize: "0.75rem", fontStyle: "italic", color: "var(--color-silver)", marginBottom: "0.4rem" }}>
            New
          </p>
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
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="Brief project description..."
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="tags" style={labelStyle}>Tags (comma-separated)</label>
            <input id="tags" type="text" value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} style={inputStyle} placeholder="Architecture, TypeScript, PostgreSQL" />
          </div>

          {/* Image upload */}
          <div style={{ ...fieldStyle, background: "var(--color-surface)", border: "1px solid rgba(192,192,192,0.08)", padding: "1.5rem", borderRadius: "2px" }}>
            <p style={{ ...labelStyle, marginBottom: "1rem" }}>Hero Image (→ AVIF)</p>
            <input
              id="hero-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1rem", display: "block" }}
            />
            {imageFile && (
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={imageUploading}
                style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-silver)", background: "none", border: "1px solid rgba(192,192,192,0.2)", padding: "0.5rem 1rem", borderRadius: "2px", cursor: "pointer", opacity: imageUploading ? 0.6 : 1 }}
              >
                {imageUploading ? "Uploading..." : "Upload & Convert to AVIF"}
              </button>
            )}
            {heroImageUrl && (
              <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)", marginTop: "0.75rem" }}>
                ✓ Uploaded: {heroImageUrl.split("/").pop()}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="submit-project"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
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
            {loading ? "Saving..." : "Save Project"}
          </button>
        </form>
      </main>
    </div>
  );
}
