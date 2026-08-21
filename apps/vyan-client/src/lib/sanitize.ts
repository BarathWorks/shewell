import sanitizeHtml from "sanitize-html";

/**
 * Sanitises rich text before it is rendered with `dangerouslySetInnerHTML`.
 *
 * Blog and session bodies are authored in Quill (1.x, long past end of life) and
 * stored as raw HTML, then injected verbatim. Anything an author could paste —
 * including a `<script>` or an `onerror` handler smuggled through a pasted
 * fragment — executed in every reader's browser with their session attached.
 *
 * The allowlist below covers what Quill actually produces. Anything outside it is
 * dropped rather than escaped, so unexpected markup disappears instead of showing
 * up as literal tags.
 */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "div", "span",
    "strong", "b", "em", "i", "u", "s", "sub", "sup",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    // Quill encodes alignment, indentation and lists as ql-* classes.
    "*": ["class"],
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  // No javascript:, data: or vbscript: URLs.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  // Untrusted outbound links must not get access to window.opener.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" },
    }),
  },
  // Inline styles are an injection surface of their own; classes are enough.
  allowedStyles: {},
  disallowedTagsMode: "discard",
};

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, options);
}
