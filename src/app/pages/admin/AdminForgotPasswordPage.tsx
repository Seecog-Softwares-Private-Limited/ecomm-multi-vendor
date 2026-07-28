"use client";

import { useState } from "react";
import { Link } from "../../components/Link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

export type AdminAuthPortal = "admin" | "superadmin";

const primaryBtnClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const PORTAL_COPY: Record<
  AdminAuthPortal,
  { title: string; subtitle: string; loginHref: string; loginLabel: string; brandLine: string }
> = {
  admin: {
    title: "Forgot password?",
    subtitle: "Enter your admin email and we’ll send you a link to reset your password.",
    loginHref: "/admin/login",
    loginLabel: "Back to Admin login",
    brandLine: "Admin panel",
  },
  superadmin: {
    title: "Forgot password?",
    subtitle: "Enter your Super Admin email and we’ll send you a link to reset your password.",
    loginHref: "/superadmin/login",
    loginLabel: "Back to Super Admin login",
    brandLine: "Super Admin Control Center",
  },
};

export function AdminForgotPasswordPage({ portal = "admin" }: { portal?: AdminAuthPortal }) {
  const copy = PORTAL_COPY[portal];
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
      const res = await fetch("/api/auth/admin-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), portal }),
      });
      const json = await res.json();
      if (!res.ok) {
        const details = json?.error?.details as Record<string, string> | undefined;
        const msg = json?.error?.message ?? details?.email ?? "Something went wrong. Please try again.";
        setError(msg);
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
      <div className="min-h-screen flex bg-[#F9FAFB]">
        <div
          className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
          style={{
            background:
              portal === "superadmin"
                ? "linear-gradient(135deg, #166534 0%, #0B1220 45%, #FF6A00 120%)"
                : "linear-gradient(135deg, #1e293b 0%, #312e81 50%, #0f172a 100%)",
          }}
        >
          <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">{copy.brandLine}</p>
          <p className="text-sm text-white/60">© Indovyapar</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
          <div className="w-full max-w-[420px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Check your email</h2>
              <p className="mt-2 text-slate-600">
                If an account exists for <strong className="text-slate-900">{email}</strong>, you will receive a
                password reset link shortly.
              </p>
              {resetLink ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                  <p className="text-sm font-medium text-amber-800">Email not configured (development)</p>
                  <p className="mt-1 text-sm text-amber-700">Use this link to reset your password:</p>
                  <a
                    href={resetLink}
                    className="mt-2 block break-all text-sm font-medium text-indigo-600 underline hover:text-indigo-700"
                  >
                    {resetLink}
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Didn’t receive it? Check spam or{" "}
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="font-medium text-[#FF6A00] hover:text-[#E55F00]"
                  >
                    try again
                  </button>
                  .
                </p>
              )}
              <Link href={copy.loginHref} className={`mt-8 inline-flex ${primaryBtnClass}`}>
                {copy.loginLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background:
            portal === "superadmin"
              ? "linear-gradient(135deg, #166534 0%, #0B1220 45%, #FF6A00 120%)"
              : "linear-gradient(135deg, #1e293b 0%, #312e81 50%, #0f172a 100%)",
        }}
      >
        <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">{copy.brandLine}</p>
        <p className="text-sm text-white/60">© Indovyapar</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden text-center">
            <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{copy.brandLine}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <Link
              href={copy.loginHref}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {copy.loginLabel}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{copy.subtitle}</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="admin-forgot-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-9 pr-4 outline-none focus:border-[#FF6A00] focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/20"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className={primaryBtnClass}>
                {loading ? "Sending…" : "Send reset link"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
