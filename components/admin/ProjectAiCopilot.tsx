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
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generateLogs, setGenerateLogs] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!draft.trim() && !githubUrl.trim()) return;
    
    setLoading(true);
    setError("");
    setGenerateLogs(["[SYSTEM] Initializing generation..."]);

    try {
      const res = await fetch("/api/generate-project-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draft, githubUrl: githubUrl.trim() }),
      });

      if (!res.body) {
        throw new Error("Failed to connect to AI server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || ""; 
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const msg = JSON.parse(trimmed);
            if (msg.type === "log") {
              setGenerateLogs(prev => {
                const cleanMsg = msg.message.replace(/\[.*?\]\s*/g, '');
                const newLogs = [...prev, `[SYSTEM] ${cleanMsg}`];
                return newLogs.slice(-2);
              });
            } else if (msg.type === "result") {
              const data = msg.data;
              if (data.description && data.description.length > 500) {
                data.description = data.description.substring(0, 497) + "...";
              }
              onAccept(data);
              setDraft("");
            } else if (msg.type === "error") {
              throw new Error(`AI_ERROR:${msg.message}`);
            }
          } catch (e: any) {
            if (e.message?.startsWith('AI_ERROR:')) {
              throw new Error(e.message.replace('AI_ERROR:', ''));
            }
            console.error("JSON parse error on line:", trimmed);
            console.error(e);
            
            if (e.message !== "Unexpected end of JSON input" && !trimmed.startsWith('{')) {
                throw new Error("Stream returned invalid data. See console.");
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate project data");
      setGenerateLogs(prev => {
        const newLogs = [...prev, `[ERROR] ${err.message}`];
        return newLogs.slice(-2);
      });
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
        Paste a rough brief and/or a GitHub repository link here. AI will extract and auto-fill the form fields below (Title, Client, Role, Tech Stack, Year, and Description).
      </p>

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexDirection: "column", width: "100%" }}>
        
        <input
          type="text"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="GitHub Repo URL (Optional, e.g., https://github.com/user/repo)"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(192,192,192,0.2)",
            borderRadius: "4px",
            padding: "0.75rem",
            color: "var(--color-text)",
            fontFamily: "var(--font-inter)",
            fontSize: "0.85rem",
          }}
        />

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", width: "100%" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
              cursor: (loading || (!draft.trim() && !githubUrl.trim())) ? "not-allowed" : "pointer",
              opacity: (loading || (!draft.trim() && !githubUrl.trim())) ? 0.5 : 1,
              whiteSpace: "nowrap"
            }}
          >
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiCpu />} 
            {loading ? "Generating..." : "Auto-Fill Form"}
          </button>
          
          {generateLogs.length > 0 && loading && (
            <div style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(192,192,192,0.1)",
              borderRadius: "2px",
              padding: "0.5rem",
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "var(--color-silver)",
              display: "flex",
              flexDirection: "column",
              gap: "0.1rem",
              maxWidth: "150px"
            }}>
              {generateLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {error && (
        <div style={{ color: "#ff4444", fontSize: "0.85rem", padding: "0.5rem", background: "rgba(255,68,68,0.1)", borderRadius: "4px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
