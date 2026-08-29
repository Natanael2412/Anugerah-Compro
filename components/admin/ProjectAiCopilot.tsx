"use client";

import { useState } from "react";
import { FiCpu, FiRefreshCw } from "react-icons/fi";

interface ProjectAiData {
  title?: string;
  slug?: string;
  client?: string;
  role?: string;
  tech_stack?: string[];
  year?: number;
  description?: string;
}

interface ProjectAiCopilotProps {
  onAccept: (data: ProjectAiData) => void;
}

export default function ProjectAiCopilot({ onAccept }: ProjectAiCopilotProps) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!draft.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-project-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draft }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      
      // Fallback truncation for description just in case AI disobeys
      if (data.description && data.description.length > 500) {
        data.description = data.description.substring(0, 497) + "...";
      }

      onAccept(data);
      // Clear draft after successful generation
      setDraft("");
    } catch (err: any) {
      setError(err.message || "Failed to generate project data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "rgba(192,192,192,0.03)",
      border: "1px solid rgba(192,192,192,0.2)",
      borderRadius: "8px",
      padding: "1.5rem",
      marginBottom: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <FiCpu size={20} color="var(--color-silver)" />
        <h3 style={{ margin: 0, fontFamily: "var(--font-helvetica)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.85rem", color: "var(--color-silver)" }}>
          Omni-AI Project Entry
        </h3>
      </div>
      
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>
        Paste a rough brief here. AI will extract and auto-fill the form fields below (Title, Client, Role, Tech Stack, Year, and Description).
      </p>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="E.g., Web company profile for PT Global, built with Next.js & Tailwind. I was Lead Frontend. Finished 2024. Very minimalist design..."
          style={{
            flex: 1,
            minHeight: "80px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(192,192,192,0.2)",
            borderRadius: "4px",
            padding: "0.75rem",
            color: "var(--color-text)",
            fontFamily: "var(--font-inter)",
            fontSize: "0.85rem",
            resize: "vertical"
          }}
        />
        <button 
          type="button"
          onClick={handleGenerate}
          disabled={loading || !draft.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--color-silver)",
            color: "var(--color-background)",
            border: "none",
            padding: "0.75rem 1.25rem",
            borderRadius: "4px",
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.75rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            cursor: (loading || !draft.trim()) ? "not-allowed" : "pointer",
            opacity: (loading || !draft.trim()) ? 0.5 : 1,
            whiteSpace: "nowrap"
          }}
        >
          {loading ? <FiRefreshCw className="animate-spin" /> : <FiCpu />} 
          {loading ? "Generating..." : "Auto-Fill Form"}
        </button>
      </div>

      {error && (
        <div style={{ color: "#ff4444", fontSize: "0.85rem", padding: "0.5rem", background: "rgba(255,68,68,0.1)", borderRadius: "4px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
