"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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

export function AddressManagementPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [savingEdit, setSavingEdit] = useState(false);

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

  const openEdit = (a: AddressItem) => {
    setEditingAddress(a);
    setEditForm({
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: editForm.fullName.trim(),
          phone: editForm.phone.trim(),
          line1: editForm.line1.trim(),
          line2: editForm.line2.trim() || null,
          city: editForm.city.trim(),
          state: editForm.state.trim(),
          pincode: editForm.pincode.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Address updated");
      setEditingAddress(null);
      await fetchAddresses();
    } catch {
      toast.error("Could not update address");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Saved Addresses</h1>
          <Link
            href="/add-address"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </Link>
        </div>

        {loading && (
          <div className="py-12 text-center text-slate-500 font-medium">
            Loading addresses…
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-600 font-medium">
            Failed to load addresses. Please try again.
          </div>
        )}

        {!loading && !error && addresses.length === 0 && (
          <div className="py-12 text-center text-slate-600">
            <p className="font-medium mb-2">No saved addresses.</p>
            <Link
              href="/add-address"
              className="inline-flex items-center gap-2 text-[#FF6A00] font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add your first address
            </Link>
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
                    {address.line2 && (
                      <p className="text-slate-700 mb-1">{address.line2}</p>
                    )}
                    <p className="text-slate-700 mb-2">
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-slate-600 text-sm">{address.phone}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
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

      {/* Edit modal */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit Address</h2>
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="p-2 text-slate-500 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address line 1</label>
                <input
                  type="text"
                  value={editForm.line1}
                  onChange={(e) => setEditForm((f) => ({ ...f, line1: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address line 2 (optional)</label>
                <input
                  type="text"
                  value={editForm.line2}
                  onChange={(e) => setEditForm((f) => ({ ...f, line2: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm((f) => ({ ...f, pincode: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] disabled:opacity-60"
                >
                  {savingEdit ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
