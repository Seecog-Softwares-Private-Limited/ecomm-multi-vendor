"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "../components/Link";
import { Lock, Eye, EyeOff, Check, X, ArrowRight } from "lucide-react";
import { registerSchema } from "@/lib/auth/validation";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwdCheck = registerSchema.pick({ password: true }).safeParse(
    password ? { password } : { password: "" }
  );
  const passwordValid = pwdCheck.success;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase & lowercase", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Invalid link. Open the reset link from your email.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    const parsed = registerSchema.pick({ password: true }).safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Password does not meet requirements.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = json?.error?.details as Record<string, string> | undefined;
        const msg =
          json?.error?.message ??
          details?.token ??
          details?.newPassword ??
          "Could not reset password. Request a new link.";
        setError(msg);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 bg-[#F9FAFB]">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl text-center">
          <IndovyaparLogo fontSize={24} className="justify-center mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Link invalid or expired</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use the link from your email, or request a new password reset.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#E55F00]"
          >
            Request reset link
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="mt-4 block text-sm font-semibold text-[#FF6A00] hover:text-[#E55F00]">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 bg-[#F9FAFB]">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
            <Check className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Password updated</h1>
          <p className="mt-2 text-sm text-slate-600">You can sign in with your new password.</p>
          <Link
            href="/login"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#E55F00]"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-[#F9FAFB]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Set new password
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/30">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">Reset password</h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Choose a strong password for your account.
          </p>

          {error && (
            <div
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/80"
              role="alert"
            >
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="reset-new-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200/80">
                <p className="mb-2 text-xs font-semibold text-slate-700">Must include:</p>
                <ul className="space-y-1.5">
                  {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-2 text-xs text-slate-600">
                      {req.met ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label htmlFor="reset-confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-600">Passwords must match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordValid || !passwordsMatch}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Update password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <Link href="/login" className="block text-sm font-semibold text-slate-600 hover:text-slate-900">
              Back to sign in
            </Link>
            <p className="text-xs text-slate-500">
              Need help?{" "}
              <Link href="/support-tickets" className="font-semibold text-[#FF6A00] hover:text-[#E55F00]">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] text-slate-600">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
