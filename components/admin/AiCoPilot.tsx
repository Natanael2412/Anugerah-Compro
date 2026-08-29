"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
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
  const { messages, append, isLoading } = useChat({
    api: '/api/chat-brief'
  });
  
  const [localInput, setLocalInput] = useState("");
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generateLogs, setGenerateLogs] = useState<string[]>([]);
  const { showToast } = useToast();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Extract brief from the latest AI message
  let latestBrief = { topic: "", audience: "", tone: "", language: "" };
  
  // Find the last AI message that contains a brief
  const aiMessages = messages.filter(m => m.role === 'assistant');
  const lastAiMessage = aiMessages[aiMessages.length - 1]?.content || "";
  
  const briefMatch = lastAiMessage.match(/<brief>([\s\S]*?)<\/brief>/);
  if (briefMatch && briefMatch[1]) {
    try {
      latestBrief = JSON.parse(briefMatch[1]);
    } catch (e) {
      // ignore parse errors while streaming
    }
  }

  // Format message to display (remove brief tag)
  const formatDisplayMessage = (content: string) => {
    return content.replace(/<brief>[\s\S]*?<\/brief>/, "").trim();
  };

  const handleManualSubmit = () => {
    if (!localInput.trim() || isLoading || isGeneratingArticle) return;
    append({ role: 'user', content: localInput });
    setLocalInput("");
  };

  async function handleGenerateFullArticle() {
    if (!latestBrief.topic) {
      showToast("Please brainstorm a topic with the AI first.", "error");
      return;
    }

    setIsGeneratingArticle(true);
    setGenerateLogs(["[SYSTEM] Initializing generation..."]);
    
    try {
      const promptPayload = `Generate a full article based on this brief:
Topic: ${latestBrief.topic}
Audience: ${latestBrief.audience}
Tone: ${latestBrief.tone}
Language: ${latestBrief.language}`;

      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptPayload }),
      });

      if (!res.body) throw new Error("Failed to connect to AI server.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; 
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === "log") {
              // Keep only last 2 lines, clean up text
              setGenerateLogs(prev => {
                const cleanMsg = msg.message.replace(/\[.*?\]\s*/g, ''); // remove previous tags like [PING]
                const newLogs = [...prev, `[SYSTEM] ${cleanMsg}`];
                return newLogs.slice(-2);
              });
            } else if (msg.type === "result") {
              onGenerateSuccess(msg.data);
              showToast("Article generated successfully!", "success");
            } else if (msg.type === "error") {
              throw new Error(msg.message);
            }
          } catch (e: any) {
            if (e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
    } catch (error: any) {
      setGenerateLogs(prev => {
        const newLogs = [...prev, `[ERROR] ${error.message}`];
        return newLogs.slice(-2);
      });
      showToast(error.message || "Failed to generate article.", "error");
    } finally {
      setIsGeneratingArticle(false);
    }
  }

  return (
    <div style={{
      marginBottom: "2.5rem",
      background: "var(--color-surface)",
      border: "1px solid rgba(192,192,192,0.15)",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ 
        padding: "1rem 1.5rem", 
        borderBottom: "1px solid rgba(192,192,192,0.1)",
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem",
        background: "rgba(255,255,255,0.02)"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-silver)" }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <h3 style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", margin: 0 }}>
          AI Article Co-Pilot
        </h3>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {/* Left: Chatbot */}
        <div style={{ 
          flex: "1 1 400px", 
          borderRight: "1px solid rgba(192,192,192,0.1)",
          display: "flex",
          flexDirection: "column",
          height: "400px"
        }}>
          {/* Chat Messages */}
          <div 
            ref={chatScrollRef}
            style={{ 
              flex: 1, 
              padding: "1.5rem", 
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
          >
            {messages.length === 0 && (
              <div style={{ 
                color: "var(--color-text-subtle)", 
                fontFamily: "var(--font-helvetica)", 
                fontSize: "0.85rem",
                textAlign: "center",
                marginTop: "2rem"
              }}>
                Start brainstorming your article ideas here...<br/>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>e.g. "I want to write about AI in modern startups in Indonesian"</span>
              </div>
            )}
            
            {messages.map(m => (
              <div key={m.id} style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                gap: "0.25rem"
              }}>
                <span style={{ 
                  fontFamily: "var(--font-helvetica)", 
                  fontSize: "0.65rem", 
                  color: "var(--color-text-subtle)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}>
                  {m.role === 'user' ? 'You' : 'AI Co-Pilot'}
                </span>
                <div style={{
                  background: m.role === 'user' ? "rgba(192,192,192,0.1)" : "rgba(0,0,0,0.3)",
                  padding: "0.75rem 1rem",
                  borderRadius: "4px",
                  border: m.role === 'user' ? "none" : "1px solid rgba(192,192,192,0.1)",
                  fontFamily: "var(--font-helvetica)",
                  fontSize: "0.85rem",
                  color: "var(--color-text)",
                  lineHeight: 1.5,
                  maxWidth: "90%",
                  whiteSpace: "pre-wrap"
                }}>
                  {formatDisplayMessage(m.content)}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "flex-start", opacity: 0.5 }}>
                <span style={{ color: "var(--color-text)", fontSize: "0.85rem" }}>...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{ 
            padding: "1rem", 
            borderTop: "1px solid rgba(192,192,192,0.1)",
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            gap: "0.5rem"
          }}>
            <input
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleManualSubmit();
                }
              }}
              placeholder="Type your ideas here..."
              disabled={isGeneratingArticle}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(192,192,192,0.2)",
                borderRadius: "2px",
                padding: "0.75rem",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.85rem",
                color: "var(--color-text)",
                outline: "none"
              }}
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={isGeneratingArticle || isLoading || !localInput.trim()}
              style={{
                background: "var(--color-text)",
                color: "var(--color-base)",
                border: "none",
                borderRadius: "2px",
                padding: "0 1rem",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                cursor: (isGeneratingArticle || isLoading || !localInput.trim()) ? "not-allowed" : "pointer",
                opacity: (isGeneratingArticle || isLoading || !localInput.trim()) ? 0.5 : 1
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Right: Live Brief & Generate */}
        <div style={{ 
          flex: "1 1 300px", 
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          background: "rgba(0,0,0,0.1)"
        }}>
          <div>
            <h4 style={{ 
              fontFamily: "var(--font-helvetica)", 
              fontSize: "0.75rem", 
              letterSpacing: "0.1em", 
              textTransform: "uppercase", 
              color: "var(--color-text)", 
              margin: "0 0 1rem 0" 
            }}>
              Live Article Brief
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Topic", value: latestBrief.topic },
                { label: "Target Audience", value: latestBrief.audience },
                { label: "Tone", value: latestBrief.tone },
                { label: "Language", value: latestBrief.language },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.65rem", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.label}
                  </span>
                  <span style={{ 
                    fontFamily: "var(--font-helvetica)", 
                    fontSize: "0.85rem", 
                    color: item.value ? "var(--color-text)" : "rgba(192,192,192,0.3)",
                    fontStyle: item.value ? "normal" : "italic" 
                  }}>
                    {item.value || "Pending..."}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {generateLogs.length > 0 && (
              <div style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(192,192,192,0.1)",
                borderRadius: "2px",
                padding: "0.75rem",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                color: "var(--color-silver)",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}>
                {generateLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateFullArticle}
              disabled={isGeneratingArticle || !latestBrief.topic}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "1rem",
                background: latestBrief.topic ? "var(--color-text)" : "rgba(192,192,192,0.1)",
                color: latestBrief.topic ? "var(--color-base)" : "rgba(192,192,192,0.5)",
                border: "none",
                borderRadius: "2px",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: (isGeneratingArticle || !latestBrief.topic) ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
            >
              {isGeneratingArticle ? "Generating Article..." : "Generate Full Article"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
