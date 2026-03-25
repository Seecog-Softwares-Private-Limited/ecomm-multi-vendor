"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/AccountLayout";

type AddressItem = {
  id: string;
  type: string;
  name: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  address: string;
};

type ModalMode = "add" | "edit";

const initialForm = () => ({
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: true,
});

export function AddressManagementPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editTarget, setEditTarget] = useState<AddressItem | null>(null);
  const [form, setForm] = useState(() => initialForm());
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAddresses(data?.data?.addresses ?? []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setForm(initialForm());
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditTarget(null);
    setForm({
      ...initialForm(),
      isDefault: addresses.length === 0,
    });
  };

  const openEditModal = (a: AddressItem) => {
    setModalMode("edit");
    setEditTarget(a);
    setForm({
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode) return;

    const { fullName, phone, line1, city, state, pincode } = form;
    if (!fullName.trim() || !phone.trim() || !line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "add") {
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
            type: "HOME",
            isDefault: form.isDefault,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data?.error?.message ?? "Could not add address.");
          return;
        }
        toast.success("Address added");
      } else if (editTarget) {
        const res = await fetch(`/api/addresses/${editTarget.id}`, {
          method: "PATCH",
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
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data?.error?.message ?? "Could not update address.");
          return;
        }
        toast.success("Address updated");
      }

      closeModal();
      await fetchAddresses();
    } catch {
      toast.error(modalMode === "add" ? "Could not add address." : "Could not update address.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Default address updated");
      await fetchAddresses();
    } catch {
      toast.error("Could not set default address");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Address removed");
      await fetchAddresses();
    } catch {
      toast.error("Could not delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00] outline-none transition";

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">Loading addresses…</div>
        )}

        {error && (
          <div className="py-12 text-center text-red-600 font-medium">
            Failed to load addresses. Please try again.
          </div>
        )}

        {!loading && !error && addresses.length === 0 && (
          <div className="py-12 text-center text-slate-600">
            <p className="font-medium mb-2">No saved addresses.</p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 text-[#FF6A00] font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add your first address
            </button>
          </div>
        )}

        {!loading && !error && addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative"
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg font-semibold">
                    Default
                  </span>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#FF6A00]/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#FF6A00]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{address.name}</p>
                      <p className="text-sm text-slate-600">{address.fullName}</p>
                    </div>
                  </div>
                  <div className="pl-0">
                    <p className="text-slate-700 mb-1">{address.line1}</p>
                    {address.line2 && <p className="text-slate-700 mb-1">{address.line2}</p>}
                    <p className="text-slate-700 mb-2">
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-slate-600 text-sm">{address.phone}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEditModal(address)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white rounded-xl font-semibold transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-slate-200 text-slate-700 hover:border-red-500 hover:text-red-600 rounded-xl font-semibold transition-colors text-sm disabled:opacity-50"
                  >
                    {deletingId === address.id ? (
                      <span className="animate-pulse">…</span>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={settingDefaultId === address.id}
                    className="w-full mt-3 py-2 text-sm text-[#FF6A00] hover:text-[#E55F00] font-semibold disabled:opacity-50"
                  >
                    {settingDefaultId === address.id ? "Updating…" : "Set as Default"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit — same layout as edit popup */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => {
            if (!saving) closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 id="address-modal-title" className="text-xl font-bold text-slate-900">
                {modalMode === "add" ? "Add New Address" : "Edit Address"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!saving) closeModal();
                }}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className={inputClass}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputClass}
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address line 1</label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                  className={inputClass}
                  required
                  autoComplete="street-address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address line 2 <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                  className={inputClass}
                  autoComplete="address-line2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className={inputClass}
                    required
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className={inputClass}
                    required
                    autoComplete="address-level1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                  className={inputClass}
                  required
                  autoComplete="postal-code"
                />
              </div>

              {modalMode === "add" && (
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="addr-default-new"
                    checked={form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]"
                  />
                  <label htmlFor="addr-default-new" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Set as default address
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="flex-1 py-2.5 border-2 border-[#FF6A00] text-[#FF6A00] bg-white rounded-xl font-semibold hover:bg-orange-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
