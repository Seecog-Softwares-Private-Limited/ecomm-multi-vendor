"use client";

import * as React from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

type PinRow = { id: string; pincode: string; createdAt: string };

type BulkSummary = {
  added: number;
  skippedExisting: number;
  invalidSamples: string[];
};

function InlineAlert({
  type,
  message,
}: {
  type: "info" | "success" | "warning" | "error";
  message: string;
}) {
  const cfg = {
    info: {
      Icon: Info,
      box: "border-blue-200 bg-blue-50",
      icon: "text-blue-500",
      text: "text-blue-800",
    },
    success: {
      Icon: CheckCircle,
      box: "border-emerald-200 bg-emerald-50",
      icon: "text-emerald-600",
      text: "text-emerald-900",
    },
    warning: {
      Icon: AlertTriangle,
      box: "border-amber-200 bg-amber-50",
      icon: "text-amber-600",
      text: "text-amber-900",
    },
    error: {
      Icon: AlertCircle,
      box: "border-red-200 bg-red-50",
      icon: "text-red-500",
      text: "text-red-800",
    },
  }[type];
  const Icon = cfg.Icon;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${cfg.box}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.icon}`}>
        <Icon className="h-5 w-5 opacity-90" />
      </div>
      <p className={`min-w-0 flex-1 text-sm leading-relaxed ${cfg.text}`}>{message}</p>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 ${className}`}
    >
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
}

export type DeliveryAreasEditorProps = {
  apiBaseUrl: string;
  voice: "vendor" | "admin";
  showTitle?: boolean;
};

export function DeliveryAreasEditor({ apiBaseUrl, voice, showTitle = true }: DeliveryAreasEditorProps) {
  const [rows, setRows] = React.useState<PinRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [bulkText, setBulkText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [restrictDeliveryToPincodes, setRestrictDeliveryToPincodes] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not load PIN list.");
        setRows([]);
        return;
      }
      const list = data?.data?.pincodes;
      setRows(Array.isArray(list) ? list : []);
      if (typeof data?.data?.restrictDeliveryToPincodes === "boolean") {
        setRestrictDeliveryToPincodes(data.data.restrictDeliveryToPincodes);
      }
    } catch {
      setError("Could not load PIN list.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const canAddPins = restrictDeliveryToPincodes && !saving && !loading;

  const updateDeliveryScope = async (restrict: boolean) => {
    setError(null);
    setSuccessMessage(null);
    setSaving(true);
    const prev = restrictDeliveryToPincodes;
    setRestrictDeliveryToPincodes(restrict);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ restrictDeliveryToPincodes: restrict }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRestrictDeliveryToPincodes(prev);
        setError(data?.error?.message ?? "Could not update delivery scope.");
        return;
      }
      if (typeof data?.data?.restrictDeliveryToPincodes === "boolean") {
        setRestrictDeliveryToPincodes(data.data.restrictDeliveryToPincodes);
      }
      if (voice === "vendor") {
        setSuccessMessage(
          restrict
            ? "Delivery is limited to the PINs in your list (empty list still counts as all-India until you add PINs)."
            : "You are delivering across all of India. Saved PINs stay below for when you turn this on again."
        );
      } else {
        setSuccessMessage(
          restrict
            ? "The marketplace is limited to the PINs in this list (empty list still behaves as all-India until PINs are added)."
            : "The marketplace is set to all-India delivery. Saved PINs remain for when you turn PIN-only back on."
        );
      }
    } catch {
      setRestrictDeliveryToPincodes(prev);
      setError("Could not update delivery scope.");
    } finally {
      setSaving(false);
    }
  };

  const addPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddPins) return;
    setError(null);
    setSuccessMessage(null);
    const digits = input.replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(digits)) {
      setError("Enter a valid 6-digit PIN.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pincode: digits }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not add PIN.");
        return;
      }
      const list = data?.data?.pincodes;
      if (Array.isArray(list)) setRows(list);
      setInput("");
      setSuccessMessage(voice === "vendor" ? `Added PIN ${digits}.` : `Added PIN ${digits}.`);
    } catch {
      setError("Could not add PIN.");
    } finally {
      setSaving(false);
    }
  };

  const addBulkPins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddPins) return;
    setError(null);
    setSuccessMessage(null);
    const trimmed = bulkText.trim();
    if (!trimmed) {
      setError("Paste one or more PINs, or use the single-PIN field above.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bulkText: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not add PINs.");
        return;
      }
      const list = data?.data?.pincodes;
      if (Array.isArray(list)) setRows(list);
      const summary = data?.data?.bulkSummary as BulkSummary | undefined;
      if (summary) {
        let msg = `Added ${summary.added} new PIN${summary.added === 1 ? "" : "s"}.`;
        if (summary.skippedExisting > 0) {
          msg += ` ${summary.skippedExisting} already on the list (skipped).`;
        }
        if (summary.invalidSamples?.length) {
          const ex = summary.invalidSamples.slice(0, 3).join("; ");
          msg += ` Ignored ${summary.invalidSamples.length} invalid entr${summary.invalidSamples.length === 1 ? "y" : "ies"}.`;
          msg += ` Examples: ${ex}${summary.invalidSamples.length > 3 ? "…" : ""}`;
        }
        setSuccessMessage(msg);
      }
      setBulkText("");
    } catch {
      setError("Could not add PINs.");
    } finally {
      setSaving(false);
    }
  };

  const removePin = async (pincode: string) => {
    setError(null);
    setSuccessMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`${apiBaseUrl}?pincode=${encodeURIComponent(pincode)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not remove PIN.");
        return;
      }
      const list = data?.data?.pincodes;
      if (Array.isArray(list)) setRows(list);
    } catch {
      setError("Could not remove PIN.");
    } finally {
      setSaving(false);
    }
  };

  const allIndiaInfo =
    voice === "vendor"
      ? rows.length > 0
        ? "All-India mode is on — your saved PINs are not used for the catalog. Turn on “Limit to listed PINs” to edit the list or add PINs."
        : "All-India mode is on — turn on “Limit to listed PINs” above if you want to add or manage PIN codes."
      : rows.length > 0
        ? "All-India mode is on — saved PINs are not used for the catalog. Turn on “Limit to listed PINs” to edit the list or add PINs."
        : "All-India mode is on — turn on “Limit to listed PINs” above to add or manage PIN codes.";

  const pinOnlyEmptyWarning =
    voice === "vendor"
      ? "You chose PIN-only delivery but the list is empty — buyers still see you as all-India until you add at least one PIN."
      : "PIN-only delivery is on but the list is empty — shoppers still see the site as all-India until at least one PIN is added.";

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400";
  const btnSecondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const inputClass =
    "w-full flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
  const textareaClass =
    "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  return (
    <div className="space-y-6 max-w-2xl">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <MapPin className="h-8 w-8 shrink-0 text-amber-600" />
            Delivery areas
          </h1>
          <p className="text-slate-600">
            Choose <span className="font-semibold text-slate-900">all-India</span> or{" "}
            <span className="font-semibold text-slate-900">PIN-only</span> delivery. Adding PINs is only available in
            PIN-only mode.
          </p>
        </div>
      )}

      <Panel>
        <p className="text-sm font-semibold text-slate-900 mb-1">Delivery coverage</p>
        <p className="text-sm text-slate-600 mb-4">
          Turn off &quot;Limit to listed PINs&quot; to offer <strong>pan-India</strong> delivery. Turn it on to use only the
          PINs listed below (no PINs in the list while limited still behaves as all-India until you add some).
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 mb-6">
          <label
            className={`flex items-center gap-3 ${saving || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div className="relative inline-block shrink-0">
              <input
                type="checkbox"
                checked={restrictDeliveryToPincodes}
                onChange={(e) => void updateDeliveryScope(e.target.checked)}
                disabled={saving || loading}
                className="sr-only"
              />
              <div
                className={`h-6 w-11 rounded-full shadow-inner transition-colors duration-200 ${
                  restrictDeliveryToPincodes ? "bg-amber-600" : "bg-slate-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    restrictDeliveryToPincodes ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-slate-700">
              Limit delivery to the PINs listed below (not &quot;all India&quot;)
            </span>
          </label>
        </div>

        {!restrictDeliveryToPincodes && (
          <div className="mb-6">
            <InlineAlert type="info" message={allIndiaInfo} />
          </div>
        )}

        {restrictDeliveryToPincodes && rows.length === 0 && !loading && (
          <div className="mb-6">
            <InlineAlert type="warning" message={pinOnlyEmptyWarning} />
          </div>
        )}

        <div
          className={`mb-6 ${!canAddPins ? "pointer-events-none select-none opacity-55" : ""}`}
          aria-disabled={!canAddPins}
        >
          <p className="text-sm font-semibold text-slate-900 mb-2">Add one PIN</p>
          <form onSubmit={addPin} className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-stretch">
            <input
              placeholder={canAddPins ? "e.g. 400001" : "Enable PIN-only mode to add"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={8}
              className={inputClass}
              disabled={!canAddPins}
            />
            <button type="submit" disabled={!canAddPins} className={`${btnPrimary} shrink-0 sm:w-auto`}>
              <Plus className="h-4 w-4" />
              Add PIN
            </button>
          </form>

          <p className="text-sm font-semibold text-slate-900 mb-2">Add many PINs</p>
          <p className="text-sm text-slate-600 mb-3">
            Paste a list separated by <strong>commas</strong>, <strong>new lines</strong>, or <strong>spaces</strong>{" "}
            (6-digit codes only). Duplicates and PINs already on the list are skipped automatically.
          </p>
          <form onSubmit={addBulkPins} className="space-y-3">
            <textarea
              placeholder={
                canAddPins ? "400001\n560001, 110001\n382480" : "Enable “Limit to listed PINs” to paste PINs here"
              }
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              disabled={!canAddPins}
              rows={6}
              className={`${textareaClass} font-mono text-sm`}
            />
            <button type="submit" disabled={!canAddPins} className={`${btnSecondary} whitespace-nowrap`}>
              <Plus className="h-4 w-4" />
              Add all PINs
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4">
            <InlineAlert type="error" message={error} />
          </div>
        )}

        {successMessage && (
          <div className="mb-4">
            <InlineAlert type="success" message={successMessage} />
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-600 text-sm border border-dashed border-slate-200 rounded-xl p-6 text-center">
            {restrictDeliveryToPincodes
              ? "No PINs yet — add codes above, or turn off “limit to listed PINs” for all-India delivery."
              : "No PINs saved. Turn on “Limit to listed PINs” to add PIN codes."}
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <span className="font-mono font-semibold text-slate-900">{r.pincode}</span>
                <button
                  type="button"
                  onClick={() => void removePin(r.pincode)}
                  disabled={saving}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={`Remove ${r.pincode}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
