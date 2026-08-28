"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface Props {
  value: string; // The URL of the image
  onChange: (url: string) => void;
  folder?: string;
}

export default function ArticleImageUpload({ value, onChange, folder = "articles/covers" }: Props) {
  const [activeTab, setActiveTab] = useState<"upload" | "ai">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
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

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) {
      showToast("Please enter an image prompt", "error");
      return;
    }
    
    setIsUploading(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, folder })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image");
      }
      
      onChange(data.url);
      showToast("AI Image generated and saved successfully!", "success");
    } catch (error: any) {
      console.error("AI Gen Error:", error);
      showToast(error.message || "Failed to generate image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", borderBottom: "1px solid rgba(192,192,192,0.1)" }}>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "upload" ? "2px solid var(--color-silver)" : "2px solid transparent",
            padding: "0.5rem 0",
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.75rem",
            color: activeTab === "upload" ? "var(--color-text)" : "var(--color-text-subtle)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Drag & Drop Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "ai" ? "2px solid var(--color-silver)" : "2px solid transparent",
            padding: "0.5rem 0",
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.75rem",
            color: activeTab === "ai" ? "var(--color-text)" : "var(--color-text-subtle)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Generate with AI
        </button>
      </div>

      {activeTab === "ai" && !value && (
        <div style={{
          padding: "1rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(192,192,192,0.1)",
          borderRadius: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isUploading}
            placeholder="Describe the image you want to generate... e.g. A futuristic workspace in Jakarta"
            style={{
              width: "100%",
              minHeight: "80px",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(192,192,192,0.1)",
              borderRadius: "2px",
              padding: "0.75rem",
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.85rem",
              color: "var(--color-text)",
              outline: "none",
              resize: "vertical"
            }}
          />
          <button
            type="button"
            onClick={handleGenerateAi}
            disabled={isUploading}
            style={{
              padding: "0.75rem",
              background: "var(--color-text)",
              color: "var(--color-base)",
              border: "none",
              borderRadius: "2px",
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            {isUploading ? "Generating..." : "Generate Image"}
          </button>
        </div>
      )}

      {(!value && activeTab === "upload") && (
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
      )}

      {value && (
        <div style={{ width: "100%", minHeight: "200px", position: "relative", borderRadius: "4px", overflow: "hidden" }}>
          <img
            src={value}
            alt="Cover Preview"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "200px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              cursor: "pointer"
            }}
            onClick={() => onChange("")}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.75rem", letterSpacing: "0.1em", color: "#fff", textTransform: "uppercase" }}>
              Remove Image
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

