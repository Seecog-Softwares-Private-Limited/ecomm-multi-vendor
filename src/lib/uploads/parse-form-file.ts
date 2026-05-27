/**
 * Parse a file from multipart FormData in Next.js Route Handlers.
 * Do not use `instanceof File` — Node/undici may return a File-like Blob that fails that check.
 */
export type ParsedFormUpload = {
  blob: Blob;
  name: string;
  type: string;
  size: number;
};

export function parseFormDataUpload(
  formData: FormData,
  fieldName = "file"
): ParsedFormUpload | null {
  const entry = formData.get(fieldName);
  if (!entry || typeof entry === "string") return null;
  if (typeof entry !== "object" || !("arrayBuffer" in entry)) return null;
  const blob = entry as Blob;
  if (typeof blob.arrayBuffer !== "function") return null;

  const name =
    entry instanceof File && entry.name
      ? entry.name
      : typeof (entry as { name?: string }).name === "string"
        ? (entry as { name: string }).name
        : "upload.jpg";

  return {
    blob,
    name,
    type: blob.type || "",
    size: blob.size,
  };
}
