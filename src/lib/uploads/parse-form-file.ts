/**
 * Parse a file from multipart FormData in Next.js Route Handlers.
 * Never use the global `File` class — it is not defined on many Node.js servers.
 */
export type ParsedFormUpload = {
  blob: Blob;
  name: string;
  type: string;
  size: number;
};

function uploadEntryName(entry: object): string {
  const n = (entry as { name?: string }).name;
  return typeof n === "string" && n.trim() ? n.trim() : "upload.jpg";
}

export function parseFormDataUpload(
  formData: FormData,
  fieldName = "file"
): ParsedFormUpload | null {
  const entry = formData.get(fieldName);
  if (!entry || typeof entry === "string") return null;
  if (typeof entry !== "object" || !("arrayBuffer" in entry)) return null;
  const blob = entry as Blob;
  if (typeof blob.arrayBuffer !== "function") return null;

  return {
    blob,
    name: uploadEntryName(entry),
    type: blob.type || "",
    size: blob.size,
  };
}
