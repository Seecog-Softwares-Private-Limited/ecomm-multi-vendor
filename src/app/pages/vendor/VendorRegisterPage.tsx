"use client";

import { useState } from "react";
import { Link } from "../../components/Link";
import {
  Mail,
  Lock,
  Store,
  Building2,
  UserCircle,
  Phone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";

const inputBase =
  "block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20";
const iconWrap = "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4";

/**
 * Vendor registration page at /vendor/register.
 * Submits to POST /api/auth/vendor-register and redirects to /vendor on success.
 */
export function VendorRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setVerificationLink(null);
    setLoading(true);
    try {
      const data = await authService.vendorRegister({
        email,
        password,
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim() || undefined,
      });
      setSuccess(true);
      if (data.verificationLink) setVerificationLink(data.verificationLink);
    } catch (err) {
      if (err instanceof ServiceError) {
        const msg = err.message;
        const details = err.details as Record<string, string> | undefined;
        const detailList =
          details && typeof details === "object" && Object.keys(details).length > 0
            ? Object.entries(details)
                .map(([field, text]) => `${field}: ${text}`)
                .join(". ")
            : "";
        setError(detailList ? `${msg}. ${detailList}` : msg);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 xl:p-14">
        <div>
          <div className="flex items-center gap-3 text-white/95">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Vendor Center</span>
          </div>
        </div>
        <div className="space-y-6">
          <blockquote className="text-slate-300 text-lg xl:text-xl leading-relaxed max-w-sm">
            “Join thousands of sellers. List products, get orders, and get paid—all from one dashboard.”
          </blockquote>
          <div className="flex gap-4">
            <div className="h-1 w-12 rounded-full bg-indigo-400" />
            <div className="h-1 w-12 rounded-full bg-white/20" />
            <div className="h-1 w-12 rounded-full bg-white/10" />
          </div>
        </div>
        <p className="text-sm text-slate-500">© Vendor Center</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-slate-50/80 overflow-y-auto">
        <div className="w-full max-w-[420px] my-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg mb-4">
              <Store className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Vendor Center</h1>
            <p className="mt-1 text-sm text-slate-500">Create your vendor account</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            {success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">You’re all set</h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-sm">
                    {verificationLink
                      ? "No email was sent (SMTP not configured). Use the link below to verify your email, then sign in."
                      : "Check your email and click the verification link to activate your account, then sign in."}
                  </p>
                </div>
                {verificationLink && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">Verification link (click or copy)</p>
                    <a
                      href={verificationLink}
                      className="block text-sm text-indigo-600 hover:text-indigo-700 break-all transition"
                    >
                      {verificationLink}
                    </a>
                  </div>
                )}
                <Link
                  href="/vendor/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800"
                >
                  Go to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Create account
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Fill in your details to register as a vendor
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
                    <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <div className={iconWrap}>
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputBase}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className={iconWrap}>
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className={inputBase}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Min 8 characters, with uppercase, lowercase and a number
                    </p>
                  </div>

                  <div>
                    <label htmlFor="reg-business" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Business name
                    </label>
                    <div className="relative">
                      <div className={iconWrap}>
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="reg-business"
                        type="text"
                        autoComplete="organization"
                        placeholder="Your store name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className={inputBase}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-owner" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Owner / contact name
                    </label>
                    <div className="relative">
                      <div className={iconWrap}>
                        <UserCircle className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="reg-owner"
                        type="text"
                        autoComplete="name"
                        placeholder="Full name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        required
                        className={inputBase}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className={iconWrap}>
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="reg-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputBase}
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
                        Create vendor account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                      href="/vendor/login"
                      className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="mt-8 text-center">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-700 transition"
            >
              Are you a customer? Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
