"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { hasNativeBridge } from "@/lib/native-bridge";

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

function isImageUrl(url: string): boolean {
  return (
    /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url) ||
    /\/uploads\/.*\.(jpe?g|png|gif|webp)/i.test(url)
  );
}

export type DocumentPreviewState = {
  url: string;
  title: string;
} | null;

type DocumentPreviewOverlayProps = {
  preview: DocumentPreviewState;
  onClose: () => void;
};

/**
 * Full-screen document viewer for vendor KYC uploads (mobile-friendly back navigation).
 */
export function DocumentPreviewOverlay({ preview, onClose }: DocumentPreviewOverlayProps) {
  const histRef = React.useRef(false);
  const inNativeApp = hasNativeBridge();

  React.useEffect(() => {
    if (!preview) {
      histRef.current = false;
      return;
    }

    const onPopState = () => {
      histRef.current = false;
      onClose();
    };

    if (!histRef.current) {
      window.history.pushState({ vendorDocPreview: true }, "");
      histRef.current = true;
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [preview, onClose]);

  const handleBack = React.useCallback(() => {
    if (histRef.current) {
      histRef.current = false;
      window.history.back();
      return;
    }
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (!preview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview, handleBack]);

  if (!preview) return null;

  const { url, title } = preview;
  const pdf = isPdfUrl(url);
  const image = isImageUrl(url);

  return (
    <div
      className="fixed inset-0 z-[130] flex flex-col bg-white pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${title}`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100">
        {pdf ? (
          <div className="flex h-full min-h-0 flex-1 flex-col">
            <iframe
              title={title}
              src={url}
              className="h-full w-full min-h-0 flex-1 border-0 bg-white"
            />
            {/* WKWebView often blanks nested PDF iframes — always offer Open. */}
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center">
              <p className="mb-2 text-xs text-slate-500">
                If the PDF looks blank, open it below.
              </p>
              {inNativeApp ? (
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign(url);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Open document
                </button>
              ) : (
                <a
                  href={url}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Open document
                </a>
              )}
            </div>
          </div>
        ) : image ? (
          <div className="flex h-full items-center justify-center overflow-auto p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={title}
              className="max-h-full max-w-full rounded-lg object-contain shadow-md"
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-slate-600">
              Preview is not available for this file type.
            </p>
            {inNativeApp ? (
              <button
                type="button"
                onClick={() => {
                  window.location.assign(url);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Open document
              </button>
            ) : (
              <a
                href={url}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Open document
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
