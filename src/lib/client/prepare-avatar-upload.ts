/**
 * Resize / re-encode profile photos before upload.
 * iOS Safari and WebView often send HEIC, empty MIME types, or files > 5 MB.
 * Canvas re-encode produces JPEG that every browser can display.
 */
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.88;
const MAX_BYTES = 4 * 1024 * 1024;

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function needsClientPrepare(file: File): boolean {
  if (file.size > MAX_BYTES) return true;
  if (isIosDevice()) return true;
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (!type || type === "application/octet-stream") return true;
  if (/heic|heif/.test(type) || /\.heic$|\.heif$/.test(name)) return true;
  if (!["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(type)) {
    return true;
  }
  return false;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try another photo."));
    };
    img.src = url;
  });
}

async function encodeToJpeg(file: File): Promise<File> {
  const img = await loadImageElement(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight, 1));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image on this device.");

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not compress image."))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  return new File([blob], "avatar.jpg", { type: "image/jpeg", lastModified: Date.now() });
}

/**
 * Returns a JPEG file suitable for POST /api/auth/me/avatar (under size limits).
 */
export async function prepareAvatarUploadFile(file: File): Promise<File> {
  if (!needsClientPrepare(file)) {
    return file;
  }
  return encodeToJpeg(file);
}
