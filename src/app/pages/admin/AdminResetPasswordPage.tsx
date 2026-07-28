"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { validateAdminNewPassword } from "@/lib/auth/admin-password";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import type { AdminAuthPortal } from "./AdminForgotPasswordPage";

const primaryBtnClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const PORTAL_COPY: Record<
  AdminAuthPortal,
  {
    brandLine: string;
    loginHref: string;
    loginLabel: string;
    forgotHref: string;
    gradient: string;
  }
> = {
  admin: {
    brandLine: "Admin panel",
    loginHref: "/admin/login",
    loginLabel: "Sign in to Admin",
    forgotHref: "/admin/forgot-password",
    gradient: "linear-gradient(135deg, #1e293b 0%, #312e81 50%, #0f172a 100%)",
  },
  superadmin: {
    brandLine: "Super Admin Control Center",
    loginHref: "/superadmin/login",
    loginLabel: "Sign in to Super Admin",
    forgotHref: "/superadmin/forgot-password",
    gradient: "linear-gradient(135deg, #166534 0%, #0B1220 45%, #FF6A00 120%)",
  },
};

function AdminResetPasswordForm({ portal }: { portal: AdminAuthPortal }) {
  const copy = PORTAL_COPY[portal];
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLoginHref, setSuccessLoginHref] = useState(copy.loginHref);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const pwdError = validateAdminNewPassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please use the link from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) {
        const details = json?.error?.details as Record<string, string> | undefined;
        const msg =
          json?.error?.message ??
          details?.token ??
          details?.newPassword ??
          "Something went wrong. Please request a new reset link.";
        setError(msg);
        return;
      }
      const isSuperAdmin = json?.data?.isSuperAdmin === true;
      setSuccessLoginHref(isSuperAdmin ? "/superadmin/login" : copy.loginHref);
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex bg-[#F9FAFB]">
        <div
          className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 xl:p-14"
          style={{ background: copy.gradient }}
        >
          <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">{copy.brandLine}</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-[420px] rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Password reset</h2>
            <p className="mt-2 text-slate-600">Your password has been updated. You can now sign in.</p>
            <Link href={successLoginHref} className={`mt-8 inline-flex ${primaryBtnClass}`}>
              {successLoginHref.includes("superadmin") ? "Sign in to Super Admin" : copy.loginLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">Invalid reset link</h2>
          <p className="mt-2 text-slate-600">Use the link from your email or request a new one.</p>
          <Link href={copy.forgotHref} className={`mt-6 inline-flex ${primaryBtnClass}`}>
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 xl:p-14"
        style={{ background: copy.gradient }}
      >
        <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">{copy.brandLine}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <Link
              href={copy.loginHref}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset password</h1>
            <p className="mt-2 text-sm text-slate-600">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="admin-reset-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-reset-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-9 pr-10 outline-none focus:border-[#FF6A00] focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/20"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">At least 8 characters with upper, lower, and a number.</p>
              </div>
              <div>
                <label htmlFor="admin-reset-confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-reset-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-9 pr-10 outline-none focus:border-[#FF6A00] focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/20"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className={primaryBtnClass}>
                {loading ? "Saving…" : "Reset password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminResetPasswordPage({ portal = "admin" }: { portal?: AdminAuthPortal }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-slate-600">Loading…</div>
      }
    >
      <AdminResetPasswordForm portal={portal} />
    </Suspense>
  );
}
