"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Articles", href: "/admin/articles" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--nav-height, 64px)",
        background: "var(--color-surface)",
        borderBottom: "1px solid rgba(192,192,192,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(1.5rem, 4vw, 3rem)",
        zIndex: 50,
      }}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <Link
        href="/admin"
        style={{
          fontFamily: "var(--font-citadel)",
          fontSize: "1rem",
          fontStyle: "italic",
          fontWeight: 700,
          background: "var(--gradient-silver)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textDecoration: "none",
          letterSpacing: "0.1em",
        }}
      >
        AV / Admin
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: pathname === href ? "var(--color-text)" : "var(--color-text-subtle)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            {label}
          </Link>
        ))}

        <button
          onClick={handleSignOut}
          id="admin-sign-out"
          style={{
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.2s ease",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
