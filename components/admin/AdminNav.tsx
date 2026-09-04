"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { LayoutDashboard, FolderOpen, FileText, LogOut, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Articles", href: "/admin/articles", icon: FileText },
];

const SIDEBAR_WIDTH = "220px";

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
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        background: "var(--color-surface)",
        borderRight: "1px solid rgba(192,192,192,0.07)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        padding: "0",
      }}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div style={{ padding: "1.75rem 1.5rem 1.5rem", borderBottom: "1px solid rgba(192,192,192,0.06)" }}>
        <Link
          href="/admin"
          style={{
            fontFamily: "var(--font-citadel)",
            fontSize: "1.1rem",
            fontStyle: "italic",
            fontWeight: 700,
            background: "var(--gradient-silver)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textDecoration: "none",
            letterSpacing: "0.05em",
            display: "block",
          }}
        >
          AV / Admin
        </Link>
        <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginTop: "0.35rem" }}>
          CMS
        </p>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: "1rem 0", flex: 1, overflowY: "auto" }}>
        <p style={{ fontFamily: "var(--font-helvetica)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-subtle)", padding: "0 1.5rem", marginBottom: "0.5rem", opacity: 0.5 }}>
          Navigation
        </p>
        {NAV_LINKS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 1.5rem",
                fontFamily: "var(--font-helvetica)",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: isActive ? "var(--color-text)" : "var(--color-text-subtle)",
                background: isActive ? "rgba(192,192,192,0.06)" : "transparent",
                borderRight: isActive ? "2px solid var(--color-silver)" : "2px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={14} style={{ opacity: isActive ? 1 : 0.5 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out at bottom */}
      <div style={{ padding: "1rem 0", borderTop: "1px solid rgba(192,192,192,0.06)" }}>
        <button
          onClick={handleSignOut}
          id="admin-sign-out"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            width: "100%",
            padding: "0.65rem 1.5rem",
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "color 0.15s ease",
          }}
        >
          <LogOut size={14} style={{ opacity: 0.5 }} />
          Sign Out
        </button>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.65rem 1.5rem",
            fontFamily: "var(--font-helvetica)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}
        >
          <ChevronRight size={14} style={{ opacity: 0.5 }} />
          View Site
        </Link>
      </div>
    </aside>
  );
}
