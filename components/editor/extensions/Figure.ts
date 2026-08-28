import { Node } from "@tiptap/core";

/**
 * Figure — Custom TipTap block node.
 * Server-safe: no React imports. Used by both the editor (client)
 * and RichTextRenderer (server-side generateHTML).
 *
 * HTML output: <figure class="av-figure">
 *                <img src alt loading="lazy" />
 *                <figcaption>caption</figcaption>
 *              </figure>
 */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => el.querySelector("img")?.getAttribute("src") ?? null,
      },
      alt: {
        default: "",
        parseHTML: (el) => el.querySelector("img")?.getAttribute("alt") ?? "",
      },
      caption: {
        default: "",
        parseHTML: (el) => el.querySelector("figcaption")?.textContent ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption } = HTMLAttributes;
    const children: unknown[] = [
      "img",
      { src, alt: alt || "", loading: "lazy" },
    ];
    return [
      "figure",
      { class: "av-figure" },
      children,
      ...(caption ? [["figcaption", {}, caption as string]] : []),
    ];
  },
});
