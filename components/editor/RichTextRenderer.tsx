import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Figure } from "./extensions/Figure";

/**
 * RichTextRenderer — Server Component.
 * Converts TipTap JSON stored in Supabase → HTML string,
 * then renders it with dangerouslySetInnerHTML.
 *
 * No TipTap/ProseMirror runs in the browser — zero client JS overhead.
 */
export default function RichTextRenderer({
  content,
  className = "prose-av",
}: {
  content: Record<string, unknown> | null | undefined;
  className?: string;
}) {
  if (!content || Object.keys(content).length === 0) return null;

  let html = "";
  try {
    html = generateHTML(content, [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, codeBlock: false, code: false }),
      Figure,
    ]);
  } catch (e) {
    console.error("[RichTextRenderer] generateHTML failed:", e);
    return null;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
