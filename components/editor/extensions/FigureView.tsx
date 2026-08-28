"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

/**
 * React NodeView for the Figure extension.
 * Renders image + editable caption input in the editor.
 * Caption input syncs to the node's `caption` attribute.
 */
export default function FigureView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const { src, alt, caption } = node.attrs as {
    src: string;
    alt: string;
    caption: string;
  };

  return (
    <NodeViewWrapper>
      <figure
        data-drag-handle
        style={{
          margin: "2rem 0",
          textAlign: "center",
          outline: selected
            ? "2px solid rgba(192,192,192,0.35)"
            : "2px solid transparent",
          borderRadius: "2px",
          transition: "outline-color 0.15s",
          userSelect: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          style={{
            maxWidth: "100%",
            borderRadius: "2px",
            display: "block",
            margin: "0 auto",
          }}
        />
        {/* Caption input — caption text auto-syncs to node attribute */}
        <input
          type="text"
          value={caption ?? ""}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Add caption (optional)…"
          // Stop ProseMirror from intercepting keyboard events inside input
          onKeyDown={(e) => e.stopPropagation()}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            background: "none",
            border: "none",
            borderBottom: "1px solid rgba(192,192,192,0.12)",
            color: "var(--color-text-subtle, #aaa)",
            fontFamily: "var(--font-helvetica, sans-serif)",
            fontSize: "0.75rem",
            fontStyle: "italic",
            letterSpacing: "0.05em",
            padding: "0.5rem 0",
            outline: "none",
            marginTop: "0.5rem",
            cursor: "text",
            userSelect: "text",
          }}
        />
      </figure>
    </NodeViewWrapper>
  );
}
