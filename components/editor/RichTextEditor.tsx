"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Figure } from "./extensions/Figure";
import FigureView from "./extensions/FigureView";
import Toolbar from "./Toolbar";

interface RichTextEditorProps {
  value?: Record<string, unknown>;
  onChange?: (json: Record<string, unknown>) => void;
  placeholder?: string;
  /** R2 folder for image uploads. Default: "cms/uploads" */
  uploadFolder?: string;
  minHeight?: string;
}

// Extend Figure with React NodeView (client-only)
const FigureWithView = Figure.extend({
  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },
});

// Empty TipTap doc
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here…",
  uploadFolder = "cms/uploads",
  minHeight = "420px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // We supply our own heading levels
        heading: { levels: [2, 3, 4] },
        // Disable code block to keep UI clean
        codeBlock: false,
        code: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      FigureWithView,
    ],
    content: value && Object.keys(value).length > 0 ? value : emptyDoc,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        style: [
          `min-height: ${minHeight}`,
          "padding: 1.5rem",
          "outline: none",
          "font-family: var(--font-helvetica, sans-serif)",
          "font-size: 0.95rem",
          "line-height: 1.8",
          "color: var(--color-text, #f8f9fa)",
        ].join("; "),
        class: "av-editor-content",
      },
    },
  });

  return (
    <div
      style={{
        border: "1px solid rgba(192,192,192,0.12)",
        borderRadius: "2px",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <Toolbar editor={editor} uploadFolder={uploadFolder} />

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Placeholder style injection */}
      <style>{`
        .av-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(248,249,250,0.25);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .av-editor-content h2 {
          font-size: 1.35rem;
          font-weight: 300;
          letter-spacing: -0.02em;
          margin: 2.5rem 0 1rem;
          color: var(--color-text, #f8f9fa);
        }
        .av-editor-content h3 {
          font-size: 1.1rem;
          font-weight: 400;
          letter-spacing: -0.01em;
          margin: 2rem 0 0.75rem;
          color: var(--color-text, #f8f9fa);
        }
        .av-editor-content h4 {
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 1.5rem 0 0.5rem;
          color: var(--color-silver, #c0c0c0);
        }
        .av-editor-content p { margin: 0 0 1em; }
        .av-editor-content blockquote {
          border-left: 2px solid rgba(192,192,192,0.3);
          margin: 1.5rem 0;
          padding: 0.25rem 0 0.25rem 1.5rem;
          font-style: italic;
          color: rgba(248,249,250,0.7);
        }
        .av-editor-content strong { font-weight: 600; }
        .av-editor-content em { font-style: italic; }
        .av-editor-content a {
          color: var(--color-silver, #c0c0c0);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .av-editor-content ul, .av-editor-content ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .av-editor-content li { margin: 0.25rem 0; }
        .av-editor-content hr {
          border: none;
          border-top: 1px solid rgba(192,192,192,0.15);
          margin: 2.5rem 0;
        }
        .av-figure figcaption {
          font-size: 0.75rem;
          font-style: italic;
          color: rgba(248,249,250,0.5);
          margin-top: 0.5rem;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}
