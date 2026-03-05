"use client";

import { useState } from "react";
import { Link } from "../../components/Link";
import { Mail, Store, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

/**
 * Vendor forgot-password page at /vendor/forgot-password.
 * Submits to POST /api/auth/vendor-forgot-password; shows success message (no email enumeration).
 */
export function VendorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetLink(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/vendor-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        const details = json?.error?.details as Record<string, string> | undefined;
        const msg = json?.error?.message ?? details?.email ?? "Something went wrong. Please try again.";
        setError(msg);
        setLoading(false);
        return;
      }
      setSubmitted(true);
      if (typeof json?.data?.resetLink === "string") setResetLink(json.data.resetLink);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Check your email</h2>
              <p className="mt-2 text-slate-600">
                If an account exists for <strong className="text-slate-900">{email}</strong>, you will receive a
                password reset link shortly.
              </p>
              {resetLink ? (
                <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-left">
                  <p className="text-sm font-medium text-amber-800">Email not configured (development)</p>
                  <p className="mt-1 text-sm text-amber-700">Use this link to reset your password:</p>
                  <a
                    href={resetLink}
                    className="mt-2 block break-all text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
                  >
                    {resetLink}
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Didn’t receive it? Check spam or{" "}
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); }}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    try again
                  </button>
                </p>
              )}
              <Link
                href="/vendor/login"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
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
            <p className="mt-1 text-sm text-slate-500">Reset your password</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot password?</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter your vendor email and we’ll send you a link to reset your password.
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
                <label htmlFor="vendor-forgot-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="vendor-forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
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
                    Send reset link
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/vendor/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 transition">
              Are you a customer? Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
