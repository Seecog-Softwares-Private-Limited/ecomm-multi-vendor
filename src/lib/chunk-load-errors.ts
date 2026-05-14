/**
 * Detect JS chunk / dynamic-import failures (often after deploy or when nginx
 * returns an HTML error page for a script URL). Used by ChunkLoadRecovery and global-error.
 */

const CHUNK_LOAD_REGEXES = [
  /ChunkLoadError/i,
  /Loading chunk [\d]+ failed/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Failed to load module script/i,
];

function messageFromUnknown(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object" && "message" in reason) {
    return String((reason as { message?: unknown }).message ?? "");
  }
  return "";
}

/** HTML error body returned instead of JS (502/503/404 page) often produces this parse error. */
function looksLikeHtmlInsteadOfJs(message: string): boolean {
  return (
    message.includes("Unexpected token '<") ||
    message.includes('Unexpected token "<') ||
    message.includes("Unexpected token \u003c")
  );
}

export function isChunkOrModuleLoadFailure(reason: unknown): boolean {
  const message = messageFromUnknown(reason);
  if (!message.trim()) return false;
  if (CHUNK_LOAD_REGEXES.some((re) => re.test(message))) return true;
  if (looksLikeHtmlInsteadOfJs(message)) return true;
  return false;
}
