"use client";

import { useToast } from "@/components/ui/ToastProvider";
import { deleteProject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Hapus proyek "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    startTransition(async () => {
      try {
        await deleteProject(id);
        showToast("Proyek berhasil dihapus.", "success");
        router.refresh();
      } catch {
        showToast("Gagal menghapus proyek.", "error");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        fontFamily: "var(--font-helvetica)",
        fontSize: "0.65rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(200,80,80,0.8)",
        background: "none",
        border: "none",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.5 : 1,
        padding: "0",
        marginLeft: "1rem",
      }}
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
