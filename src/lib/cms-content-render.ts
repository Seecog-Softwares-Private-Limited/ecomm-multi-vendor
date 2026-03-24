/**
 * CMS footer pages store either HTML (from rich paste) or plain text (line breaks, "- " bullets).
 * Plain text must not use dangerouslySetInnerHTML or newlines collapse to a single paragraph.
 */
export function isLikelyHtmlContent(raw: string): boolean {
  const t = raw.trim();
  if (!t.length) return false;
  // Opening/closing tags or common void tags (e.g. <br>, <hr>)
  return /<\/?[a-z][a-z0-9]*\b/i.test(t) || /<(br|hr|img|input)\b/i.test(t);
}
