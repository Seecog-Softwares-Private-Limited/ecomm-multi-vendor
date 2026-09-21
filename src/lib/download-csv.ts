import { hasNativeBridge, postToNative } from "@/lib/native-bridge";

/** Escape a CSV cell (RFC-style quotes). */
export function escapeCsvCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toBase64Utf8(text: string): string {
  if (typeof window === "undefined") return "";
  // btoa only handles Latin1 — encode UTF-8 first.
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

/**
 * Trigger a CSV download in browser, or hand off to the Vendor App WebView shell
 * (blob: downloads are often blocked inside React Native WebView).
 */
export function downloadCsvFile(filename: string, csvBody: string): void {
  const csv = csvBody.startsWith("\uFEFF") ? csvBody : `\uFEFF${csvBody}`;

  if (hasNativeBridge()) {
    const ok = postToNative({
      type: "custom",
      name: "DOWNLOAD_CSV",
      payload: {
        filename,
        csv,
        base64: toBase64Utf8(csv),
        mimeType: "text/csv;charset=utf-8",
      },
    });
    if (ok) return;
  }

  // Desktop / mobile browser fallback.
  try {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
    return;
  } catch {
    /* fall through to data URL */
  }

  const a = document.createElement("a");
  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
