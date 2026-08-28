"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface Props {
  value: string; // The URL of the image
  onChange: (url: string) => void;
  folder?: string;
}

export default function ArticleImageUpload({ value, onChange, folder = "articles/covers" }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      onChange(data.url);
      showToast("Cover image uploaded successfully!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload cover image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        await uploadFile(file);
      }
    },
    [folder, onChange, showToast]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: "100%",
        minHeight: "200px",
        border: `1px dashed ${isDragging ? "var(--color-silver)" : "rgba(192,192,192,0.2)"}`,
        borderRadius: "4px",
        background: isDragging ? "rgba(192,192,192,0.05)" : "rgba(255,255,255,0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp, image/avif"
        onChange={handleFileChange}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          zIndex: 10,
        }}
        disabled={isUploading}
      />

      {isUploading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid rgba(192,192,192,0.2)",
              borderTopColor: "var(--color-silver)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-text-subtle)", textTransform: "uppercase" }}>
            Uploading...
          </span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : value ? (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <img
            src={value}
            alt="Cover Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "#fff", textTransform: "uppercase", pointerEvents: "none" }}>
              Click or drag to replace
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", pointerEvents: "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-subtle)" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--color-text)", marginTop: "0.5rem" }}>
            Upload Cover Image
          </span>
          <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", color: "var(--color-text-subtle)" }}>
            Drag and drop or click to browse
          </span>
        </div>
      )}
    </div>
  );
}
