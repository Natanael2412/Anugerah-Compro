"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor | null;
  /** Folder in R2 to upload images to. Default: "cms/uploads" */
  uploadFolder?: string;
}

type BtnProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function Btn({ onClick, active, disabled, title, children }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        if (!disabled) onClick();
      }}
      style={{
        background: active ? "rgba(192,192,192,0.15)" : "none",
        border: "none",
        borderRadius: "2px",
        color: active
          ? "var(--color-text, #f8f9fa)"
          : "var(--color-text-subtle, #9aa)",
        fontFamily: "var(--font-helvetica, sans-serif)",
        fontSize: "0.72rem",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.04em",
        padding: "0.3rem 0.55rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.12s, color 0.12s",
        lineHeight: 1,
        minWidth: "1.8rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: "1px",
        height: "16px",
        background: "rgba(192,192,192,0.15)",
        display: "inline-block",
        margin: "0 0.25rem",
        alignSelf: "center",
      }}
    />
  );
}

export default function Toolbar({ editor, uploadFolder = "cms/uploads" }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", uploadFolder);

      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");

      const { url } = (await res.json()) as { url: string };

      // Insert Figure node with filename as default alt/caption
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      editor
        .chain()
        .focus()
        .insertContent({
          type: "figure",
          attrs: { src: url, alt: baseName, caption: "" },
        })
        .run();
    } catch (err) {
      console.error("[Toolbar] Image upload error:", err);
      alert("Image upload failed. Check console for details.");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!editor) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.1rem",
        padding: "0.4rem 0.6rem",
        background: "var(--color-surface, #051011)",
        borderBottom: "1px solid rgba(192,192,192,0.1)",
        borderRadius: "2px 2px 0 0",
        userSelect: "none",
      }}
    >
      {/* Headings */}
      <Btn
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Btn>
      <Btn
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Btn>
      <Btn
        title="Heading 4"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        H4
      </Btn>

      <Divider />

      {/* Inline marks */}
      <Btn
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </Btn>
      <Btn
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </Btn>

      <Divider />

      {/* Block elements */}
      <Btn
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </Btn>
      <Btn
        title="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        ≡
      </Btn>
      <Btn
        title="Numbered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </Btn>
      <Btn
        title="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ─
      </Btn>

      <Divider />

      {/* Image upload */}
      <Btn
        title={uploading ? "Uploading…" : "Insert Image (→ R2 AVIF)"}
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? "⏳" : "🖼"}
      </Btn>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
