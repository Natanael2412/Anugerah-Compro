"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface GalleryDropzoneProps {
  onUploadSuccess: (urls: string[]) => void;
  existingUrls?: string[];
}

export default function GalleryDropzone({ onUploadSuccess, existingUrls = [] }: GalleryDropzoneProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>(existingUrls);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newUrls: string[] = [];

    try {
      // Process files sequentially to avoid overwhelming the server/connection
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "projects/gallery");

        const res = await fetch("/api/upload-image", { method: "POST", body: formData });
        const data = await res.json();
        
        if (data.url) {
          newUrls.push(data.url);
        } else {
          console.error("Upload failed for file:", file.name, data.error);
          showToast(`Gagal upload: ${file.name}`, "error");
        }
      }

      if (newUrls.length > 0) {
        const updatedUrls = [...urls, ...newUrls];
        setUrls(updatedUrls);
        onUploadSuccess(updatedUrls);
        showToast(`${newUrls.length} gambar berhasil diupload!`, "success");
      }
    } catch (err) {
      console.error("Gallery upload failed:", err);
      showToast("Upload gallery gagal.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    const updatedUrls = urls.filter(url => url !== urlToRemove);
    setUrls(updatedUrls);
    onUploadSuccess(updatedUrls);
  };

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid rgba(192,192,192,0.08)",
      padding: "1.5rem",
      borderRadius: "2px",
    }}>
      <p style={{
        fontFamily: "var(--font-helvetica)",
        fontSize: "0.62rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--color-text-subtle)",
        marginBottom: "1rem",
      }}>Project Gallery</p>

      <div style={{ marginBottom: "1rem" }}>
        <input 
          type="file" 
          multiple 
          accept="image/jpeg,image/jpg,image/png,image/webp" 
          onChange={(e) => handleFiles(e.target.files)} 
          disabled={uploading}
          style={{ 
            fontFamily: "var(--font-helvetica)", 
            fontSize: "0.8rem", 
            color: "var(--color-text-subtle)", 
            display: "block" 
          }} 
        />
        {uploading && (
          <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", color: "var(--color-silver)", marginTop: "0.5rem" }}>
            Uploading...
          </p>
        )}
      </div>

      {urls.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
          gap: "0.5rem",
          marginTop: "1rem"
        }}>
          {urls.map((url, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1/1", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(192,192,192,0.2)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`Gallery ${i}`} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button 
                type="button" 
                onClick={() => handleRemove(url)}
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  background: "rgba(0,0,0,0.8)",
                  border: "none",
                  color: "white",
                  fontSize: "10px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
