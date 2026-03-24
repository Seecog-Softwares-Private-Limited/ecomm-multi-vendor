"use client";

import { useState, useEffect } from "react";
import { User, Lock, LogOut, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20";
const labelBase = "block text-sm font-medium text-slate-700 mb-1.5";

type AdminMe = { firstName: string; lastName: string; email: string; phone: string };

export function AdminProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminMe>({
    firstName: "Admin",
    lastName: "User",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        const d = json?.success ? (json.data as Record<string, unknown>) : null;
        if (d) {
          setProfile({
            firstName: (typeof d.firstName === "string" ? d.firstName : "") || "Admin",
            lastName: (typeof d.lastName === "string" ? d.lastName : "") || "User",
            email: typeof d.email === "string" ? d.email : "",
            phone: typeof d.phone === "string" ? d.phone : "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveChanges() {
    setSaveMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveMessage({ type: "error", text: json?.error?.message ?? "Failed to save" });
        return;
      }
      setSaveMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword() {
    setPasswordMessage(null);
    if (!currentPassword.trim()) {
      setPasswordMessage({ type: "error", text: "Enter your current password." });
      return;
    }
    if (!newPassword.trim()) {
      setPasswordMessage({ type: "error", text: "Enter a new password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPasswordMessage({ type: "error", text: json?.error?.message ?? "Failed to update password." });
        return;
      }
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function handleLogout() {
    await authService.logout();
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Admin Profile Settings
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/30 sm:p-8 ring-1 ring-slate-100/50">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                <p className="text-sm text-slate-500">Update your name and contact details</p>
              </div>
            </div>
            {saveMessage && (
              <div
                className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 ${
                  saveMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-red-50 text-red-700 ring-1 ring-red-200"
                }`}
              >
                {saveMessage.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : null}
                <span className="text-sm font-medium">{saveMessage.text}</span>
              </div>
            )}
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelBase}>First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                    className={inputBase}
                  />
                </div>
              </div>
              <div>
                <label className={labelBase}>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className={inputBase}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className={labelBase}>Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className={inputBase}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Change Password */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/30 sm:p-8 ring-1 ring-slate-100/50">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                <p className="text-sm text-slate-500">Set a new password for your account</p>
              </div>
            </div>
            {passwordMessage && (
              <div
                className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-red-50 text-red-700 ring-1 ring-red-200"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : null}
                <span className="text-sm font-medium">{passwordMessage.text}</span>
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className={labelBase}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={inputBase}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className={labelBase}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 chars, upper, lower, number)"
                  className={inputBase}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={labelBase}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={inputBase}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A00] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {updatingPassword ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                {updatingPassword ? "Updating…" : "Update Password"}
              </button>
            </div>
          </section>

          {/* Account Actions */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/30 sm:p-8 ring-1 ring-slate-100/50">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Account Actions</h2>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
