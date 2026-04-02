"use client";

import { Link } from "../components/Link";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ShoppingBag,
  KeyRound,
} from "lucide-react";
import * as React from "react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20";

/** Left marketing panel — matches LoginPage / RegisterPage */
function ForgotPasswordBrandPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #1E5128 0%, #166534 22%, #c2410c 55%, #FF6A00 85%, #FF5400 100%)",
      }}
    >
      <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/10" />
      <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-white/5" />
      <div className="absolute top-1/2 left-[-80px] w-[220px] h-[220px] rounded-full bg-white/5 -translate-y-1/2" />

      <div className="relative z-10">
        <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">
          India&apos;s Marketplace
        </p>
      </div>

      <div className="space-y-6 relative z-10">
        <blockquote className="text-white/95 text-lg xl:text-xl leading-relaxed max-w-sm font-medium">
          Secure your account in seconds. We&apos;ll email you a link to choose a new password.
        </blockquote>
        <div className="flex gap-3">
          <div className="h-1.5 w-14 rounded-full bg-white/90" />
          <div className="h-1.5 w-14 rounded-full bg-white/25" />
          <div className="h-1.5 w-14 rounded-full bg-white/15" />
        </div>
        <div className="flex flex-col gap-3">
          {[
            { icon: ShieldCheck, text: "Encrypted, secure reset links" },
            { icon: ShoppingBag, text: "Same account — orders & addresses" },
            { icon: Truck, text: "Back to shopping in no time" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2.5"
            >
              <Icon className="h-5 w-5 text-white/90 shrink-0" />
              <span className="text-sm font-medium text-white/95">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-white/50 relative z-10">© Indovyapar</p>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  /** Shown in development when SMTP is off so you can still test the reset flow. */
  const [devResetLink, setDevResetLink] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDevResetLink(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.error?.message ?? "Could not send reset email. Please try again.";
        setError(msg);
        return;
      }
      const link = json?.data?.resetLink;
      if (typeof link === "string" && link.length > 0) {
        setDevResetLink(link);
      }
      setEmail(trimmed);
      setSubmitted(true);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-[#F9FAFB]">
        <ForgotPasswordBrandPanel />

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-10">
          <div className="w-full max-w-[400px]">
            <div className="lg:hidden flex flex-col items-center text-center mb-6 sm:mb-10">
              <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Password help
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/30 text-center">
              <div className="mx-auto mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-600 shrink-0" aria-hidden />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Check your email
              </h1>
              <p className="mt-2 sm:mt-3 text-sm text-slate-600 leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold text-slate-900 break-all">{email}</span>, you&apos;ll
                receive a link to reset your password shortly.
              </p>

              <div className="mt-4 sm:mt-6 rounded-xl bg-slate-50 px-3 sm:px-4 py-3 text-left text-sm text-slate-600 ring-1 ring-slate-200/80">
                <p>
                  <span className="font-semibold text-slate-800">Tip:</span> Check spam or promotions.
                  Links usually expire within an hour.
                </p>
              </div>

              {devResetLink && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-left text-xs break-all ring-1 ring-amber-200/80">
                  <span className="font-semibold text-amber-900">Dev only (no email sent):</span>{" "}
                  <a href={devResetLink} className="font-medium text-[#FF6A00] underline hover:text-[#E55F00]">
                    Open reset link
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError(null);
                  setDevResetLink(null);
                }}
                className="mt-5 sm:mt-6 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:border-[#FF6A00]/40 hover:bg-orange-50/50"
              >
                Use a different email
              </button>

              <Link
                href="/login"
                className="mt-5 sm:mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Back to sign in
              </Link>
            </div>

            <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500 px-1">
              Need help?{" "}
              <Link href="/support-tickets" className="font-semibold text-[#FF6A00] hover:text-[#E55F00]">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-[#F9FAFB]">
      <ForgotPasswordBrandPanel />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex flex-col items-center text-center mb-6 sm:mb-10">
            <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Forgot password
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/30">
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
                <KeyRound className="h-6 w-6 sm:h-7 sm:w-7 text-[#FF6A00]" aria-hidden />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Enter the email you use for Indovyapar. We&apos;ll send you a secure link if an account
                exists.
              </p>
            </div>

            {error && (
              <div
                className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/80"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/90 px-3 sm:px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/80 leading-snug">
                <span className="font-semibold text-slate-800">Security:</span> Reset links expire in
                about an hour. We never show whether an email is registered.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Back to sign in
              </Link>
            </div>
          </div>

          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500 px-1">
            <Link href="/register" className="font-semibold text-[#FF6A00] hover:text-[#E55F00]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
