"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import {
  cmsFooterPublicPath,
  getCmsFooterPageMeta,
  isValidCmsFooterSlug,
} from "@/lib/cms-footer-pages";

const textareaClass =
  "w-full min-h-[320px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20";

export function AdminCmsEditorPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const meta = slug && isValidCmsFooterSlug(slug) ? getCmsFooterPageMeta(slug) : null;

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!meta || !slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/cms/footer-pages/${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const d = json?.success ? (json.data as Record<string, unknown>) : null;
        if (d) {
          setTitle(typeof d.title === "string" ? d.title : meta.label);
          setContent(typeof d.content === "string" ? d.content : "");
        }
      })
      .catch(() => {
        if (!cancelled) setMessage({ type: "error", text: "Failed to load page." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, meta]);

  async function handleSave() {
    if (!slug || !meta) return;
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/footer-pages/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: json?.error?.message ?? "Save failed" });
        return;
      }
      setMessage({ type: "success", text: "Saved." });
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  if (!meta || !slug) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-slate-600">Invalid page.</p>
        <Link href="/admin/cms" className="mt-4 inline-block text-amber-700 font-medium text-sm hover:underline">
          Back to CMS
        </Link>
      </div>
    );
  }

  const backHref = `/admin/cms/${meta.sectionId}`;
  const publicUrl = cmsFooterPublicPath(slug);

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-amber-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        {meta.sectionId.replace(/-/g, " ")}
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title || meta.label}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Storefront URL:{" "}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline font-medium"
            >
              {publicUrl}
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-2">
        Plain text keeps line breaks and bullet lines as you type. Paste HTML (with tags like{" "}
        <code className="rounded bg-slate-200/80 px-1">&lt;p&gt;</code>,{" "}
        <code className="rounded bg-slate-200/80 px-1">&lt;ul&gt;</code>) for rich layout. Only trusted admins should publish content.
      </p>

      {message && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : (
        <textarea
          className={textareaClass}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          aria-label="Page content"
        />
      )}
    </div>
  );
}
