"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface GalleryDropzoneProps {
  existingUrls?: string[];
  onChange?: (files: File[], remainingUrls: string[]) => void;
}

export default function GalleryDropzone({ existingUrls = [], onChange }: GalleryDropzoneProps) {
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (newFilesList: FileList | null) => {
    if (!newFilesList || newFilesList.length === 0) return;
    
    const newFiles = Array.from(newFilesList);
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    if (onChange) {
      onChange(updatedFiles, urls);
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    const updatedUrls = urls.filter(url => url !== urlToRemove);
    setUrls(updatedUrls);
    if (onChange) {
      onChange(files, updatedUrls);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, i) => i !== indexToRemove);
    setFiles(updatedFiles);
    if (onChange) {
      onChange(updatedFiles, urls);
    }
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
          accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm" 
          onChange={(e) => handleFiles(e.target.files)} 
          style={{ 
            fontFamily: "var(--font-helvetica)", 
            fontSize: "0.8rem", 
            color: "var(--color-text-subtle)", 
            display: "block" 
          }} 
        />
      </div>

      {(urls.length > 0 || files.length > 0) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
          gap: "0.5rem",
          marginTop: "1rem"
        }}>
          {urls.map((url, i) => {
            const isVideo = url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm");
            return (
              <div key={`url-${i}`} style={{ position: "relative", aspectRatio: "1/1", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(192,192,192,0.2)" }}>
                {isVideo ? (
                  <video 
                    src={url} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={url} 
                    alt={`Gallery ${i}`} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              <button 
                type="button" 
                onClick={() => handleRemoveUrl(url)}
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
          )})}
          
          {files.map((file, i) => {
            const isVideo = file.type.startsWith("video/");
            const previewUrl = URL.createObjectURL(file);
            return (
              <div key={`file-${i}`} style={{ position: "relative", aspectRatio: "1/1", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(192,192,192,0.2)" }}>
                {isVideo ? (
                  <video 
                    src={previewUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={previewUrl} 
                    alt={`New Gallery ${i}`} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              <button 
                type="button" 
                onClick={() => handleRemoveFile(i)}
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
          )})}
        </div>
      )}
    </div>
  );
}
