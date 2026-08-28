"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

interface AiCoPilotProps {
  onGenerateSuccess: (data: {
    title: string;
    excerpt: string;
    tags: string;
    contentHtml: string;
  }) => void;
}

export default function AiCoPilot({ onGenerateSuccess }: AiCoPilotProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  async function handleGenerate() {
    if (!prompt.trim()) {
      showToast("Please enter a prompt idea first.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate article");
      }

      const data = await res.json();
      
      onGenerateSuccess({
        title: data.title,
        excerpt: data.excerpt,
        tags: data.tags,
        contentHtml: data.contentHtml,
      });

      showToast("Article generated successfully!", "success");
      setPrompt(""); // Clear prompt on success
    } catch (error) {
      console.error("[AiCoPilot] Error:", error);
      showToast("Failed to generate article. Make sure API keys are set.", "error");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{
      marginBottom: "2.5rem",
      padding: "1.5rem",
      background: "var(--color-surface)",
      border: "1px solid rgba(192,192,192,0.15)",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-silver)" }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)" }}>
          AI Co-Pilot
        </h3>
      </div>
      
      <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.8rem", color: "var(--color-text-subtle)", margin: 0 }}>
        Describe the article you want to write. The AI will generate a complete draft including title, formatting, SEO excerpt, and tags.
      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isGenerating}
        placeholder="e.g. Write a professional article about the impact of artificial intelligence on venture capital in Southeast Asia..."
        style={{
          width: "100%",
          minHeight: "80px",
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(192,192,192,0.1)",
          borderRadius: "2px",
          padding: "1rem",
          fontFamily: "var(--font-helvetica)",
          fontSize: "0.9rem",
          color: "var(--color-text)",
          outline: "none",
          resize: "vertical",
          opacity: isGenerating ? 0.5 : 1
        }}
      />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            background: "var(--color-text)",
            color: "var(--color-base)",
            border: "none",
            borderRadius: "2px",
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: isGenerating ? "not-allowed" : "pointer",
            opacity: isGenerating ? 0.7 : 1,
            transition: "opacity 0.2s"
          }}
        >
          {isGenerating ? (
            <>
              <div style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--color-base)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              Generating Draft...
            </>
          ) : (
            <>Generate Full Article</>
          )}
        </button>
      </div>
    </div>
  );
}
