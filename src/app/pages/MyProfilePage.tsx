"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Camera, Edit2, LogOut } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
};

type Stats = {
  orderCount: number;
  wishlistCount: number;
  addressCount: number;
};

export function MyProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        if (data?.data?.user) {
          setUser(data.data.user);
          setFormFirstName(data.data.user.firstName ?? "");
          setFormLastName(data.data.user.lastName ?? "");
          setFormPhone(data.data.user.phone ?? "");
        }
        if (data?.data?.stats) setStats(data.data.stats);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : user?.email?.split("@")[0] ?? "User";
  const initials = (displayName || "U").slice(0, 2).toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: formFirstName.trim() || null,
          lastName: formLastName.trim() || null,
          phone: formPhone.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstName: formFirstName.trim() || null,
              lastName: formLastName.trim() || null,
              phone: formPhone.trim() || null,
            }
          : null
      );
      setEditOpen(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to update password");
        return;
      }
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </AccountLayout>
    );
  }

  if (error || !user) {
    return (
      <AccountLayout>
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-6 sm:p-8">
          <p className="text-red-600 font-medium">
            Failed to load profile. Please log in again or try later.
          </p>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-5 sm:space-y-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-4 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#166534] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold sm:h-24 sm:w-24">
                  {initials}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-7 w-7 bg-[#FF6A00] rounded-full flex items-center justify-center text-white hover:bg-[#E55F00] transition-colors shadow-lg sm:h-8 sm:w-8"
                  aria-label="Change photo"
                >
                  <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
              <div className="min-w-0">
                <h2 className="mb-1 text-2xl font-bold text-[#111827] leading-tight break-words">{displayName}</h2>
                <p className="text-gray-600 break-all">{user.email}</p>
                {user.phone && <p className="text-gray-600 break-words">{user.phone}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#FF6A00] text-[#FF6A00] rounded-xl hover:bg-[#FF6A00] hover:text-white transition-colors font-semibold"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-[#F9FAFB] rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#111827] mb-1">{stats?.orderCount ?? 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Total Orders</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#111827] mb-1">{stats?.wishlistCount ?? 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Wishlist Items</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#111827] mb-1">{stats?.addressCount ?? 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">Saved Addresses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 className="text-xl font-bold text-[#111827] mb-6">Personal Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-gray-500">First Name</dt>
              <dd className="text-[#111827] font-medium">{user.firstName || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Last Name</dt>
              <dd className="text-[#111827] font-medium">{user.lastName || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Email</dt>
              <dd className="text-[#111827] font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-500">Phone</dt>
              <dd className="text-[#111827] font-medium">{user.phone || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 className="text-xl font-bold text-[#111827] mb-6">Change Password</h3>
          <button
            type="button"
            onClick={() => setPasswordOpen(true)}
            className="px-6 py-3 bg-[#111827] text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Update Password
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 className="text-xl font-bold text-[#111827] mb-6">Logout</h3>
          <p className="text-slate-600 mb-4">Sign out of your account on this device.</p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-70"
          >
            <LogOut className="w-5 h-5" />
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-6">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">First Name</label>
                <input
                  type="text"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Last Name</label>
                <input
                  type="text"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors bg-[#F9FAFB]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 px-4 py-3 bg-[#FF6A00] text-white rounded-xl font-semibold hover:bg-[#E55F00] disabled:opacity-70"
                >
                  {savingProfile ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-6">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors bg-[#F9FAFB]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF6A00] focus:outline-none transition-colors bg-[#F9FAFB]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex-1 px-4 py-3 bg-[#111827] text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-70"
                >
                  {savingPassword ? "Updating…" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
