"use client";

import { Lock, User, CreditCard, Save, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button, Input, Card, Alert, Modal } from "../components/UIComponents";
import { vendorService } from "@/services/vendor.service";
import { useApi } from "@/lib/hooks/useApi";
import { ServiceError } from "@/services/errors";
import { useRouter } from "next/navigation";
import { Link } from "@/app/components/Link";
import * as React from "react";

const DEACTIVATE_CONFIRM_PHRASE = "DEACTIVATE";
const DELETE_CONFIRM_PHRASE = "DELETE";

export function VendorSettings() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useApi(() => vendorService.getMe());
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useApi(() => vendorService.getProfile());
  const [activeTab, setActiveTab] = React.useState("password");

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordBusy, setPasswordBusy] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [profileBusy, setProfileBusy] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = React.useState<string | null>(null);
  const profileHydratedRef = React.useRef(false);

  const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);
  const [deactivatePassword, setDeactivatePassword] = React.useState("");
  const [deactivateConfirm, setDeactivateConfirm] = React.useState("");
  const [deactivating, setDeactivating] = React.useState(false);
  const [deactivateError, setDeactivateError] = React.useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const accountAlreadyInactive =
    me?.status === "on_hold" ||
    me?.status === "blocked" ||
    me?.rawStatus === "ON_HOLD" ||
    me?.rawStatus === "SUSPENDED";

  const isApproved = profile?.status === "approved";

  React.useEffect(() => {
    if (!profile || profileHydratedRef.current) return;
    setDisplayName(profile.business?.displayName ?? me?.businessName ?? "");
    setEmail(profile.owner?.email ?? me?.email ?? "");
    setMobile(profile.owner?.mobile ?? "");
    profileHydratedRef.current = true;
  }, [profile, me]);

  const tabs = [
    { id: "password", label: "Change Password", icon: Lock },
    { id: "profile", label: "Profile Info", icon: User },
  ];

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password don't match");
      return;
    }
    setPasswordBusy(true);
    try {
      const result = await vendorService.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(result.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof ServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update password"
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    const name = displayName.trim();
    if (!name) {
      setProfileError("Vendor display name is required");
      return;
    }
    if (!isApproved) {
      const em = email.trim();
      const mob = mobile.trim();
      if (!em) {
        setProfileError("Email address is required");
        return;
      }
      if (!mob) {
        setProfileError("Mobile number is required");
        return;
      }
    }

    setProfileBusy(true);
    try {
      await vendorService.updateProfile({
        business: { displayName: name },
        ...(isApproved
          ? {}
          : {
              owner: {
                email: email.trim(),
                mobile: mobile.trim(),
              },
            }),
      });
      profileHydratedRef.current = false;
      await refetchProfile();
      setProfileSuccess(
        isApproved
          ? "Display name submitted. Storefront changes may require admin approval."
          : "Profile updated successfully."
      );
    } catch (err) {
      setProfileError(
        err instanceof ServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update profile"
      );
    } finally {
      setProfileBusy(false);
    }
  };

  const openDeactivateModal = () => {
    setDeactivatePassword("");
    setDeactivateConfirm("");
    setDeactivateError(null);
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    if (deactivating) return;
    setShowDeactivateModal(false);
    setDeactivatePassword("");
    setDeactivateConfirm("");
    setDeactivateError(null);
  };

  const openDeleteModal = () => {
    setDeletePassword("");
    setDeleteConfirm("");
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteConfirm("");
    setDeleteError(null);
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      const payload: { password?: string; confirm?: string } = {};
      if (deletePassword.trim()) {
        payload.password = deletePassword;
      } else {
        payload.confirm = deleteConfirm.trim();
      }
      await vendorService.deleteAccount(payload);
      setShowDeleteModal(false);
      router.push("/vendor/login?deleted=1");
    } catch (err) {
      const message =
        err instanceof ServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete account. Please try again.";
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setDeactivateError(null);
    setDeactivating(true);
    try {
      const payload: { password?: string; confirm?: string } = {};
      if (deactivatePassword.trim()) {
        payload.password = deactivatePassword;
      } else {
        payload.confirm = deactivateConfirm.trim();
      }

      await vendorService.deactivateAccount(payload);
      setShowDeactivateModal(false);
      router.push("/vendor/login?deactivated=1");
    } catch (err) {
      const message =
        err instanceof ServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to deactivate account. Please try again.";
      setDeactivateError(message);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold leading-snug text-[#1E293B] sm:text-2xl lg:text-3xl">Settings</h1>
        <p className="text-sm leading-relaxed text-[#64748B]">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all sm:w-auto sm:min-w-0 sm:px-6 ${
                activeTab === tab.id
                  ? "bg-[#3B82F6] text-white shadow-lg"
                  : "border-2 border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#3B82F6]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "password" && (
        <Card title="Change Password">
          <div className="space-y-6">
            <Alert
              type="info"
              message="Use a strong password with at least 8 characters, including uppercase, lowercase, and a number. Google/Apple-only accounts can set a password via Forgot password."
            />

            {passwordError && <Alert type="error" message={passwordError} />}
            {passwordSuccess && <Alert type="success" message={passwordSuccess} />}

            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 8 characters with upper, lower, and a number"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/vendor/forgot-password"
                className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB]"
              >
                Forgot password?
              </Link>
              <Button variant="primary" onClick={() => void handleChangePassword()} disabled={passwordBusy}>
                <Save className="w-5 h-5" />
                {passwordBusy ? "Updating…" : "Update Password"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "profile" && (
        <div className="space-y-6">
          {(meLoading || profileLoading) && !profileHydratedRef.current ? (
            <Card title="Business Information">
              <p className="text-sm text-[#64748B]">Loading profile…</p>
            </Card>
          ) : (
            <>
              <Alert
                type="warning"
                title={isApproved ? "Storefront edits may need approval" : "Keep your contact details current"}
                message={
                  isApproved
                    ? "Approved vendors can update display name here. Email and mobile are managed in Profile & KYC."
                    : "Update your display name, email, and mobile. Full KYC details are in Profile & KYC."
                }
              />

              {profileError && <Alert type="error" message={profileError} />}
              {profileSuccess && <Alert type="success" message={profileSuccess} />}

              <Card title="Business Information">
                <div className="space-y-6">
                  <Input
                    label="Vendor Display Name"
                    placeholder="Your store name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    helperText="This name will be visible to customers"
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText={
                      isApproved
                        ? "Read-only after approval. Use Profile & KYC for account changes."
                        : "Used for important account notifications"
                    }
                    required
                    disabled={isApproved}
                  />

                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    helperText={
                      isApproved
                        ? "Read-only after approval. Use Profile & KYC for account changes."
                        : "Used for order and payout notifications"
                    }
                    required
                    disabled={isApproved}
                  />

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                      variant="secondary"
                      onClick={() => router.push("/vendor/profile")}
                    >
                      Open Profile & KYC
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => void handleUpdateProfile()}
                      disabled={profileBusy}
                    >
                      <Save className="w-5 h-5" />
                      {profileBusy ? "Saving…" : "Update Profile"}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Bank Account">
                <Alert
                  type="info"
                  message="To update your bank account details, please visit the Profile & KYC section. Bank changes require document verification and admin approval."
                />
                <div className="flex justify-start mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/vendor/profile?tab=business_info")}
                  >
                    <CreditCard className="w-5 h-5" />
                    Go to Profile & KYC
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      <Card title="Danger Zone">
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="font-semibold text-red-800 mb-2">Deactivate Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Deactivating your account will hide all your products and prevent new orders. You can
              reactivate anytime by contacting support.
            </p>
            {accountAlreadyInactive ? (
              <p className="text-sm font-medium text-red-800">
                Your account is already deactivated or suspended.
              </p>
            ) : (
              <Button variant="danger" size="sm" onClick={openDeactivateModal}>
                Deactivate Account
              </Button>
            )}
          </div>

          <div className="bg-red-50 border-2 border-red-600 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-red-700 shrink-0" />
              <h4 className="font-bold text-red-800">Delete Account</h4>
            </div>
            <p className="text-sm text-red-700 mb-1">
              Permanently deletes your vendor account and associated personal data.{" "}
              <strong>This cannot be undone.</strong>
            </p>
            <p className="text-sm text-red-600 mb-4">
              Some historically required records (e.g. completed order references, settlements) may be
              retained in anonymised form as required by law.
            </p>
            <Button variant="danger" size="sm" onClick={openDeleteModal}>
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Account Permanently"
        size="sm"
      >
        <div className="space-y-4">
          <Alert
            type="error"
            title="This action is permanent and cannot be undone."
            message="Deleting your account will permanently remove your profile, vendor documents, bank information, notifications, and products that are not part of existing orders. Some historical order and financial records may be retained in anonymised form as required by law."
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your account password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            helperText={`If you signed in with Google or Apple, leave password blank and type ${DELETE_CONFIRM_PHRASE} below.`}
          />

          {!deletePassword.trim() && (
            <Input
              label={`Type ${DELETE_CONFIRM_PHRASE} to confirm`}
              placeholder={DELETE_CONFIRM_PHRASE}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          )}

          {deleteError && <Alert type="error" message={deleteError} />}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              className="min-h-11 w-full sm:w-auto"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="min-h-11 w-full sm:w-auto"
              onClick={handleDeleteAccount}
              disabled={
                deleting ||
                (!deletePassword.trim() && deleteConfirm.trim() !== DELETE_CONFIRM_PHRASE)
              }
            >
              {deleting ? "Deleting…" : "Permanently Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeactivateModal}
        onClose={closeDeactivateModal}
        title="Deactivate Account"
        size="sm"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            message="This will hide your products from the marketplace and log you out. Existing orders may still need to be fulfilled."
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your account password"
            value={deactivatePassword}
            onChange={(e) => setDeactivatePassword(e.target.value)}
            helperText={`If you sign in with Google only, leave password blank and type ${DEACTIVATE_CONFIRM_PHRASE} below.`}
          />

          {!deactivatePassword.trim() && (
            <Input
              label={`Type ${DEACTIVATE_CONFIRM_PHRASE} to confirm`}
              placeholder={DEACTIVATE_CONFIRM_PHRASE}
              value={deactivateConfirm}
              onChange={(e) => setDeactivateConfirm(e.target.value)}
            />
          )}

          {deactivateError && <Alert type="error" message={deactivateError} />}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              className="min-h-11 w-full sm:w-auto"
              onClick={closeDeactivateModal}
              disabled={deactivating}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="min-h-11 w-full sm:w-auto"
              onClick={handleDeactivateAccount}
              disabled={
                deactivating ||
                (!deactivatePassword.trim() && deactivateConfirm.trim() !== DEACTIVATE_CONFIRM_PHRASE)
              }
            >
              {deactivating ? "Deactivating…" : "Deactivate Account"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
