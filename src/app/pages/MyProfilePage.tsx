"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogOut, Trash2 } from "lucide-react";
import { AccountLayout } from "@/components/AccountLayout";
import { ProfileDashboardSkeleton } from "@/components/profile/ProfileDashboardSkeleton";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { ProfileQuickActions } from "@/components/profile/ProfileQuickActions";
import { ProfileOrderSummary } from "@/components/profile/ProfileOrderSummary";
import { ProfileRecentActivity } from "@/components/profile/ProfileRecentActivity";
import { ProfileAccountOptions } from "@/components/profile/ProfileAccountOptions";
import { ProfileGuestState } from "@/components/profile/ProfileGuestState";
import { CustomerErrorState } from "@/components/ui-customer/CustomerErrorState";
import type { OrderListRow } from "@/components/orders/OrderListCard";
import { countOrdersByFilter } from "@/lib/orders/order-list-utils";
import { getGuestCartCount, subscribeToGuestCartChanges } from "@/lib/guest-cart";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  hasPassword?: boolean;
};

type Stats = {
  orderCount: number;
  wishlistCount: number;
  addressCount: number;
};

const CART_UPDATED_EVENT = "indovyapar-cart-updated";

export function MyProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<OrderListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const { openCartDrawer } = useCartDrawer();

  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/items", { credentials: "include" });
      if (!res.ok) {
        setCartCount(getGuestCartCount());
        return;
      }
      const json = await res.json().catch(() => ({}));
      const items = json?.data?.items ?? [];
      const total = Array.isArray(items)
        ? items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity ?? 1), 0)
        : 0;
      setCartCount(total);
    } catch {
      setCartCount(getGuestCartCount());
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const u = data?.data?.user;
      if (!u || u.role !== "CUSTOMER") {
        setIsGuest(true);
        setUser(null);
        setStats(null);
        setOrders([]);
        return;
      }
      setIsGuest(false);
      setUser(u);
      setStats(data?.data?.stats ?? null);
      setFormFirstName(u.firstName ?? "");
      setFormLastName(u.lastName ?? "");
      setFormPhone(u.phone ?? "");
      setAvatarPreview(u.avatarUrl ?? null);

      const ordersRes = await fetch("/api/orders", { credentials: "include" });
      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        setOrders(
          (ordersJson?.data?.orders ?? []).map((order: OrderListRow) => ({
            ...order,
            previewItems: order.previewItems ?? [],
          }))
        );
      }
      await fetchCartCount();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchCartCount]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const onCartUpdated = () => void fetchCartCount();
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);
    const unsub = subscribeToGuestCartChanges(() => setCartCount(getGuestCartCount()));
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
      unsub();
    };
  }, [fetchCartCount]);

  const orderCounts = useMemo(() => {
    const c = countOrdersByFilter(orders, "");
    return {
      pending: c.pending + c.processing,
      shipped: c.shipped,
      delivered: c.delivered,
      cancelled: c.cancelled,
    };
  }, [orders]);

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
        body: JSON.stringify({ currentPassword, newPassword }),
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;

    const maxBytes = 5 * 1024 * 1024;
    if (picked.size > maxBytes * 2) {
      toast.error("Image is too large. Choose a smaller photo or take a new one.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    setUploadingAvatar(true);
    let objectUrl: string | null = null;
    try {
      const { prepareAvatarUploadFile } = await import("@/lib/client/prepare-avatar-upload");
      const file = await prepareAvatarUploadFile(picked);
      if (file.size > maxBytes) {
        toast.error("Image must be 5 MB or smaller after processing.");
        return;
      }
      objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      const fd = new FormData();
      fd.append("file", file, file.name || "avatar.jpg");
      const res = await fetch("/api/auth/me/avatar", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof data?.error?.message === "string"
            ? data.error.message
            : "Failed to upload photo"
        );
        setAvatarPreview(user?.avatarUrl ?? null);
        return;
      }
      const url: string = data?.data?.avatarUrl ?? objectUrl;
      setAvatarPreview(url);
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : null));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
      setAvatarPreview(user?.avatarUrl ?? null);
    } finally {
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletingAccount(true);
    try {
      const body: { password?: string; confirm?: string } = {};
      if (user?.hasPassword) body.password = deletePassword;
      else body.confirm = deleteConfirm.trim();

      const res = await fetch("/api/auth/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to delete account");
        return;
      }
      toast.success("Your account has been deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setDeletingAccount(false);
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
      setLogoutOpen(false);
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <ProfileDashboardSkeleton />
      </AccountLayout>
    );
  }

  if (isGuest) {
    return <ProfileGuestState />;
  }

  if (error || !user) {
    return (
      <AccountLayout>
        <CustomerErrorState
          title="Couldn't load profile"
          message="Failed to load profile. Please try again later."
          onRetry={() => void fetchProfile()}
          showContinueShopping={false}
        />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-5 sm:space-y-6">
        <ProfileHeaderCard
          user={user}
          avatarPreview={avatarPreview}
          uploadingAvatar={uploadingAvatar}
          onEditClick={() => setEditOpen(true)}
          onAvatarClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
        />
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="sr-only"
          onChange={handleAvatarChange}
          aria-label="Upload profile photo"
        />

        <ProfileQuickActions
          orderCount={stats?.orderCount}
          wishlistCount={stats?.wishlistCount}
          cartCount={cartCount}
          addressCount={stats?.addressCount}
          onCartClick={openCartDrawer}
        />

        <ProfileOrderSummary counts={orderCounts} />

        <ProfileRecentActivity orders={orders} />

        <ProfileAccountOptions
          onEditProfile={() => setEditOpen(true)}
          onChangePassword={() => setPasswordOpen(true)}
          onDeleteAccount={() => {
            setDeleteConfirm("");
            setDeletePassword("");
            setDeleteOpen(true);
          }}
        />

        <section aria-label="Sign out" className="pt-2">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-70 sm:w-auto sm:px-6"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            Log out
          </button>
        </section>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access orders, wishlist, and saved addresses on this
              device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleLogout();
              }}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            role="dialog"
            aria-labelledby="edit-profile-title"
          >
            <h3 id="edit-profile-title" className="mb-6 text-xl font-bold text-slate-900">
              Edit Profile
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">First Name</label>
                <input
                  type="text"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 focus:border-[#FF6A00] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Last Name</label>
                <input
                  type="text"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 focus:border-[#FF6A00] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 focus:border-[#FF6A00] focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 rounded-xl bg-[#FF6A00] px-4 py-3 font-semibold text-white hover:bg-[#E55F00] disabled:opacity-70"
                >
                  {savingProfile ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8" role="dialog">
            <h3 className="mb-6 text-xl font-bold text-slate-900">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 focus:border-[#FF6A00] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 focus:border-[#FF6A00] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 pr-12 focus:border-[#FF6A00] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordOpen(false)}
                  className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-70"
                >
                  {savingPassword ? "Updating…" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8" role="dialog">
            <h3 className="mb-2 text-xl font-bold text-red-700">Delete account permanently?</h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              This removes your profile, orders, addresses, cart, wishlist, and support tickets.
              This cannot be undone.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {user.hasPassword ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Password</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 focus:border-red-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    required
                    placeholder="DELETE"
                    className="w-full rounded-xl border-2 border-gray-200 bg-slate-50 px-4 py-3 uppercase focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deletingAccount}
                  className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    deletingAccount || (!user.hasPassword && deleteConfirm.trim() !== "DELETE")
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingAccount ? "Deleting…" : "Delete forever"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
