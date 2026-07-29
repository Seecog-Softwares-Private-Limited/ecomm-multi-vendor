"use client";

import { memo } from "react";
import Image from "next/image";
import { Camera, Edit2, Loader2 } from "lucide-react";
import { getProfileDisplayName, getProfileInitials } from "@/lib/profile/profile-dashboard-utils";

type ProfileHeaderCardProps = {
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  avatarPreview: string | null;
  uploadingAvatar: boolean;
  onEditClick: () => void;
  onAvatarClick: () => void;
};

export const ProfileHeaderCard = memo(function ProfileHeaderCard({
  user,
  avatarPreview,
  uploadingAvatar,
  onEditClick,
  onAvatarClick,
}: ProfileHeaderCardProps) {
  const displayName = getProfileDisplayName(user);
  const initials = getProfileInitials(displayName);

  return (
    <section
      aria-label="Profile overview"
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-lg sm:h-24 sm:w-24">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6A00] to-[#166534] text-2xl font-bold text-white sm:text-3xl"
                  aria-hidden
                >
                  {initials}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6A00] text-white shadow-lg transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 disabled:opacity-70"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{displayName}</h1>
            <p className="mt-1 break-all text-sm text-slate-600">{user.email}</p>
            {user.phone && <p className="mt-0.5 text-sm text-slate-600">{user.phone}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#FF6A00] px-4 py-2.5 text-sm font-semibold text-[#FF6A00] transition hover:bg-[#FF6A00] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 sm:w-auto"
        >
          <Edit2 className="h-4 w-4" aria-hidden />
          Edit Profile
        </button>
      </div>
    </section>
  );
});
