"use client";

import * as React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url) || /\/uploads\/.*\.(jpe?g|png|gif|webp)/i.test(url);
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
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          Open <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100">
        {pdf ? (
          <iframe
            title={title}
            src={url}
            className="h-full w-full flex-1 border-0 bg-white"
          />
        ) : image ? (
          <div className="flex h-full items-center justify-center overflow-auto p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={title} className="max-h-full max-w-full rounded-lg object-contain shadow-md" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-slate-600">Preview is not available for this file type.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Open document <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
