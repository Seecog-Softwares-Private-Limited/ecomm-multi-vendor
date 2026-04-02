"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { Lock, Store, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { vendorRegisterSchema } from "@/lib/auth/validation";

function VendorResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const pwdCheck = vendorRegisterSchema.pick({ password: true }).safeParse({ password });
    if (!pwdCheck.success) {
      setError(pwdCheck.error.issues[0]?.message ?? "Password does not meet requirements");
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please use the link from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/vendor-reset-password", {
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
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 xl:p-14">
          <div className="flex items-center gap-3 text-white/95">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Vendor Center</span>
          </div>
          <blockquote className="text-slate-300 text-lg xl:text-xl leading-relaxed max-w-sm">
            “One place to manage inventory, orders, and payouts. Simple and fast.”
          </blockquote>
          <p className="text-sm text-slate-500">© Vendor Center</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-slate-50/80">
          <div className="w-full max-w-[400px]">
            <div className="lg:hidden flex flex-col items-center text-center mb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg mb-4">
                <Store className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Vendor Center</h1>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Password reset</h2>
              <p className="mt-2 text-slate-600">Your password has been updated. You can now sign in with your new password.</p>
              <Link
                href="/vendor/login"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800"
              >
                Sign in to Vendor Center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 xl:p-14">
          <div className="flex items-center gap-3 text-white/95">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Vendor Center</span>
          </div>
          <p className="text-sm text-slate-500">© Vendor Center</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-slate-50/80">
          <div className="w-full max-w-[400px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Invalid or missing link</h2>
              <p className="mt-2 text-slate-600">Please use the link from your password reset email, or request a new one.</p>
              <Link
                href="/vendor/forgot-password"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Request reset link
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Link href="/vendor/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 xl:p-14">
        <div className="flex items-center gap-3 text-white/95">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Store className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Vendor Center</span>
        </div>
        <div className="space-y-6">
          <blockquote className="text-slate-300 text-lg xl:text-xl leading-relaxed max-w-sm">
            “One place to manage inventory, orders, and payouts. Simple and fast.”
          </blockquote>
          <div className="flex gap-4">
            <div className="h-1 w-12 rounded-full bg-indigo-400" />
            <div className="h-1 w-12 rounded-full bg-white/20" />
            <div className="h-1 w-12 rounded-full bg-white/10" />
          </div>
        </div>
        <p className="text-sm text-slate-500">© Vendor Center</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-slate-50/80">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg mb-4">
              <Store className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Vendor Center</h1>
            <p className="mt-1 text-sm text-slate-500">Set a new password</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Set new password</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                At least 8 characters, with uppercase, lowercase, and a number (same rules as registration).
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/80"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="vendor-reset-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="vendor-reset-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="vendor-reset-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="vendor-reset-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Reset password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link href="/vendor/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50">Loading…</div>}>
      <VendorResetPasswordForm />
    </Suspense>
  );
}
