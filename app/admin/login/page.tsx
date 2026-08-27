"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--color-base)",
    padding: "2rem",
  } as React.CSSProperties,
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "var(--color-surface)",
    border: "1px solid rgba(192,192,192,0.08)",
    padding: "2.5rem",
    borderRadius: "4px",
  } as React.CSSProperties,
  logo: {
    fontFamily: "var(--font-citadel)",
    fontSize: "2rem",
    fontStyle: "italic",
    fontWeight: 700,
    background: "var(--gradient-silver)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  label: {
    fontFamily: "var(--font-helvetica)",
    fontSize: "0.65rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--color-text-subtle)",
    marginBottom: "2rem",
    display: "block",
  },
  fieldLabel: {
    fontFamily: "var(--font-helvetica)",
    fontSize: "0.65rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--color-text-subtle)",
    display: "block",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(192,192,192,0.12)",
    borderRadius: "2px",
    padding: "0.75rem 1rem",
    fontFamily: "var(--font-helvetica)",
    fontSize: "0.9rem",
    color: "var(--color-text)",
    outline: "none",
    marginBottom: "1.25rem",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "0.85rem",
    background: "rgba(192,192,192,0.1)",
    border: "1px solid rgba(192,192,192,0.2)",
    borderRadius: "2px",
    fontFamily: "var(--font-helvetica)",
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "var(--color-text)",
    cursor: "pointer",
    transition: "background 0.2s ease",
  } as React.CSSProperties,
  error: {
    fontFamily: "var(--font-helvetica)",
    fontSize: "0.8rem",
    color: "#ff6b6b",
    marginBottom: "1rem",
    display: "block",
  },
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <span style={s.logo}>AV</span>
        <span style={s.label}>Admin Access</span>

        <form onSubmit={handleSubmit} noValidate>
          {error && <span style={s.error}>{error}</span>}

          <div>
            <label htmlFor="email" style={s.fieldLabel}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
              placeholder="admin@anugerahventures.id"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" style={s.fieldLabel}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            style={{ ...s.button, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
