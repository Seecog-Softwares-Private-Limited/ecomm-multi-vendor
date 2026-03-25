"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Link } from "../components/Link";
import { ChevronRight, MapPin } from "lucide-react";

const inputClass =
  "w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl bg-white text-[#111827] placeholder:text-slate-400 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 outline-none transition text-[15px]";

function AddNewAddressInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturn = searchParams.get("returnUrl")?.trim();
  const returnUrl =
    rawReturn && rawReturn.startsWith("/") && !rawReturn.startsWith("//")
      ? rawReturn
      : "/checkout";

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "HOME" as "HOME" | "OFFICE" | "OTHER",
    isDefault: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { fullName, phone, line1, city, state, pincode } = form;
    if (!fullName.trim() || !phone.trim() || !line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          line1: line1.trim(),
          line2: form.line2.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          type: form.type,
          isDefault: form.isDefault,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to save an address.");
          router.push(`/login?returnUrl=${encodeURIComponent("/add-address")}`);
          return;
        }
        toast.error(data?.error?.message ?? "Could not save address.");
        return;
      }
      toast.success("Address saved.");
      router.push(returnUrl);
    } catch {
      toast.error("Could not save address.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb — matches checkout / account tone */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6 sm:mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#FF6A00] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" aria-hidden />
          <Link href="/checkout" className="hover:text-[#FF6A00] transition-colors">
            Checkout
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" aria-hidden />
          <span className="text-slate-900 font-semibold truncate">Add address</span>
        </nav>

        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-6 sm:mb-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00]">
                <MapPin className="w-5 h-5" aria-hidden />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Add new address
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Used for delivery. You can manage saved addresses anytime from your account.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Full name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Enter full name"
                  className={inputClass}
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Mobile number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className={inputClass}
                  required
                  autoComplete="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Address line 1 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                  placeholder="Street, building name"
                  className={inputClass}
                  required
                  autoComplete="street-address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Address line 2 <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                  placeholder="Apartment, suite, unit, etc."
                  className={inputClass}
                  autoComplete="address-line2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="City"
                    className={inputClass}
                    required
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    State <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="State"
                    className={inputClass}
                    required
                    autoComplete="address-level1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Pincode <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                  placeholder="6-digit pincode"
                  className={inputClass}
                  required
                  autoComplete="postal-code"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">Address type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "HOME" | "OFFICE" | "OTHER",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="HOME">Home</option>
                  <option value="OFFICE">Office</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="add-addr-default"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                />
                <label htmlFor="add-addr-default" className="text-sm font-medium text-[#374151] cursor-pointer">
                  Set as default address
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Link
                  href={returnUrl}
                  className="flex-1 py-3 rounded-xl font-semibold text-center border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#FF6A00] hover:bg-[#E55F00] shadow-md shadow-orange-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving…" : "Save address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddNewAddressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">
          Loading…
        </div>
      }
    >
      <AddNewAddressInner />
    </Suspense>
  );
}
