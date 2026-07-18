"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Phone, User } from "lucide-react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import { toast } from "sonner";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { resolveImageUrl } from "@/lib/utils/resolve-image-url";

function profileInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string
): string {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  if (name) {
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase() || "?";
  }
  const local = email.split("@")[0]?.trim();
  return (local?.slice(0, 2) ?? "?").toUpperCase();
}

function ProfileAvatar({
  avatarUrl,
  previewUrl,
  firstName,
  lastName,
  email,
}: {
  avatarUrl?: string | null;
  previewUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const displayUrl = previewUrl ?? avatarUrl;
  const resolved = displayUrl?.startsWith("blob:")
    ? displayUrl
    : resolveImageUrl(displayUrl);
  const initials = profileInitials(firstName, lastName, email);

  React.useEffect(() => {
    setFailed(false);
  }, [displayUrl]);

  if (!resolved || failed) {
    return (
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1B7A43] to-[#135C32] flex items-center justify-center text-white text-xl font-semibold shadow-sm">
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-sm"
    />
  );
}

type MeUser = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl?: string | null;
  oauthProvider?: string | null;
  needsProfileCompletion?: boolean;
};

export function CompleteProfilePage() {
  const router = useRouter();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [user, setUser] = React.useState<MeUser | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const [phone, setPhone] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = res.ok ? await res.json() : null;
        const me = json?.data?.user as MeUser | undefined;
        if (!me) {
          router.replace("/login?callbackUrl=/complete-profile");
          return;
        }
        if (me.needsProfileCompletion === false) {
          router.replace("/");
          return;
        }
        setUser(me);
        setPhone(me.phone ?? "");
        setFirstName(me.firstName ?? "");
        setLastName(me.lastName ?? "");
      } catch {
        toast.error("Could not load your profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;

    const maxBytes = 5 * 1024 * 1024;
    if (picked.size > maxBytes * 2) {
      toast.error("Image is too large. Choose a smaller photo.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    setUploadingAvatar(true);
    let objectUrl: string | null = null;
    try {
      const { prepareAvatarUploadFile } = await import("@/lib/client/prepare-avatar-upload");
      const file = await prepareAvatarUploadFile(picked);
      if (file.size > maxBytes) {
        toast.error("Image must be 5 MB or smaller.");
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
        toast.error(data?.error?.message ?? "Failed to upload photo.");
        setAvatarPreview(null);
        return;
      }
      const url: string = data?.data?.avatarUrl ?? objectUrl;
      setAvatarPreview(url);
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
      toast.success("Profile photo added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo.");
      setAvatarPreview(null);
    } finally {
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const validatePhone = (): string | null => {
    const trimmed = phone.trim();
    if (!trimmed) return "Mobile number is required.";
    if (!normalizeIndianPhone(trimmed)) return INDIAN_MOBILE_HINT;
    return null;
  };

  const submit = async (skipOptional: boolean) => {
    const phoneErr = validatePhone();
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/complete-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone: phone.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          skipOptional,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Could not save your details.");
        return;
      }
      toast.success(skipOptional ? "Mobile number saved." : "Profile details saved.");
      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B7A43]" />
      </div>
    );
  }

  const emailReadOnly = Boolean(user?.oauthProvider);
  const hasPhoto = Boolean(
    avatarPreview ?? resolveImageUrl(user?.avatarUrl)
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-5">
        <div className="max-w-md mx-auto flex justify-center">
          <IndovyaparLogo className="h-8" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Complete your profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add your mobile number to continue shopping on IndoVyapar.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="relative">
              <ProfileAvatar
                avatarUrl={user?.avatarUrl}
                previewUrl={avatarPreview}
                firstName={firstName || user?.firstName}
                lastName={lastName || user?.lastName}
                email={user?.email ?? ""}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#1B7A43] text-white flex items-center justify-center shadow-md hover:bg-[#135C32] disabled:opacity-60"
                aria-label={hasPhoto ? "Change profile photo" : "Add profile photo"}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </div>
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="text-sm font-medium text-[#1B7A43] hover:underline disabled:opacity-60"
            >
              {hasPhoto ? "Change photo" : "Add profile photo"}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-slate-50 text-slate-600"
                value={user?.email ?? ""}
                readOnly
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Mobile number <span className="text-red-500">*</span>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              First name
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  readOnly={emailReadOnly && Boolean(firstName)}
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Last name
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                readOnly={emailReadOnly && Boolean(lastName)}
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              disabled={submitting || uploadingAvatar}
              onClick={() => submit(false)}
              className="w-full py-3 rounded-xl bg-[#1B7A43] text-white font-semibold hover:bg-[#135C32] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Save details
            </button>
            <button
              type="button"
              disabled={submitting || uploadingAvatar}
              onClick={() => submit(true)}
              className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Skip for now
            </button>
            <p className="text-xs text-center text-slate-500">
              Mobile number is required.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
