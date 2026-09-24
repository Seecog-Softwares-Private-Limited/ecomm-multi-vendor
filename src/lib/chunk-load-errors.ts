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
  // Stale webpack runtime vs old /_next/static chunks (common after HMR/redeploy).
  /Cannot read properties of undefined \(reading ['"]call['"]\)/i,
];

function messageFromUnknown(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object" && "message" in reason) {
    return String((reason as { message?: unknown }).message ?? "");
  }
  return "";
}

function stackFromUnknown(reason: unknown): string {
  if (reason instanceof Error && reason.stack) return reason.stack;
  if (reason && typeof reason === "object" && "stack" in reason) {
    return String((reason as { stack?: unknown }).stack ?? "");
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

/** Webpack module-factory mismatch (stale chunks) — confirm via stack when possible. */
function looksLikeWebpackFactoryMismatch(message: string, stack: string): boolean {
  if (!/Cannot read properties of undefined \(reading ['"]call['"]\)/i.test(message)) {
    return false;
  }
  // If we have a stack, require webpack/RSC markers so we don't catch unrelated TypeErrors.
  if (!stack.trim()) return true;
  return /webpack|__webpack_require__|requireModule|options\.factory/i.test(stack);
}

export function isChunkOrModuleLoadFailure(reason: unknown): boolean {
  const message = messageFromUnknown(reason);
  if (!message.trim()) return false;
  if (CHUNK_LOAD_REGEXES.some((re) => re.test(message))) {
    if (/reading ['"]call['"]\)/i.test(message)) {
      return looksLikeWebpackFactoryMismatch(message, stackFromUnknown(reason));
    }
    return true;
  }
  if (looksLikeHtmlInsteadOfJs(message)) return true;
  return false;
}
