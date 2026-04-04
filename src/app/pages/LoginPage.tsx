"use client";

import { Link } from "../components/Link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import { getGuestCart, clearGuestCart } from "@/lib/guest-cart";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import { syncCustomerDefaultAddressToDeliveryLocation } from "@/lib/delivery-location";

type LoginMode = "email" | "phone";
type PhoneStep = "number" | "otp";

/** Matches prisma/seed.ts demo customer (development convenience only). */
const SEED_CUSTOMER_EMAIL = "customer@example.com";
const SEED_CUSTOMER_PASSWORD = "Customer@123";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDev = process.env.NODE_ENV === "development";
  const [loginMode, setLoginMode] = React.useState<LoginMode>(isDev ? "email" : "phone");
  const [phoneStep, setPhoneStep] = React.useState<PhoneStep>("number");
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState(isDev ? SEED_CUSTOMER_EMAIL : "");
  const [password, setPassword] = React.useState(isDev ? SEED_CUSTOMER_PASSWORD : "");
  const [phone, setPhone] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sendOtpLoading, setSendOtpLoading] = React.useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = React.useState(false);
  const [resendSeconds, setResendSeconds] = React.useState(0);
  const [devOtpHint, setDevOtpHint] = React.useState<string | null>(null);
  const [smsTraceId, setSmsTraceId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const returnUrl =
    searchParams?.get("returnUrl") ?? searchParams?.get("callbackUrl") ?? "/";

  React.useEffect(() => {
    const fromUrl = searchParams?.get("email")?.trim();
    if (fromUrl) setEmail(fromUrl);
    // Show any OAuth error passed via query param
    const oauthErr = searchParams?.get("error")?.trim();
    if (oauthErr) setError(oauthErr);
  }, [searchParams]);

  const mergeGuestCartAndGoHome = React.useCallback(async () => {
    const guestItems = getGuestCart();
    if (guestItems.length > 0) {
      for (const it of guestItems) {
        await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: it.productId,
            quantity: it.quantity,
            variantKey: it.variantKey ?? null,
          }),
        });
      }
      clearGuestCart();
    }
    await syncCustomerDefaultAddressToDeliveryLocation();
    await new Promise((r) => setTimeout(r, 50));
    router.push(returnUrl);
  }, [router, returnUrl]);

  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const requestOtp = async () => {
    setError(null);
    setDevOtpHint(null);
    setSmsTraceId(null);
    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Please enter your mobile number.");
      return;
    }
    if (!normalizeIndianPhone(trimmed)) {
      setError(INDIAN_MOBILE_HINT);
      return;
    }
    setSendOtpLoading(true);
    try {
      const res = await fetch("/api/auth/phone-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const apiMsg = data?.error?.message ?? "Could not send OTP. Try again.";
        const apiCode = data?.error?.code as string | undefined;
        setError(
          apiCode === "INTERNAL_ERROR"
            ? `${apiMsg} On the live server, check the app logs (e.g. pm2 logs / Docker logs) — production hides the real reason.`
            : apiMsg
        );
        return;
      }
      const d = data?.data;
      setDevOtpHint(typeof d?.devOtp === "string" ? d.devOtp : null);
      setSmsTraceId(typeof d?.smsTraceId === "string" ? d.smsTraceId : null);
      setPhoneStep("otp");
      setOtpCode("");
      setResendSeconds(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError("Enter the 6-digit code from your SMS.");
      return;
    }
    setVerifyOtpLoading(true);
    try {
      const res = await fetch("/api/auth/phone-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.trim(), code: otpCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Invalid or expired code.");
        setVerifyOtpLoading(false);
        return;
      }
      await mergeGuestCartAndGoHome();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Invalid email or password.");
        setLoading(false);
        return;
      }
      await mergeGuestCartAndGoHome();
      return;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      {/* Left panel — brand (hidden on small screens) */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1E5128 0%, #166534 22%, #c2410c 55%, #FF6A00 85%, #FF5400 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/10" />
        <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-[-80px] w-[220px] h-[220px] rounded-full bg-white/5 -translate-y-1/2" />

        <div className="relative z-10">
          <Link href="/">
            <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">
            India&apos;s Marketplace
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <blockquote className="text-white/95 text-lg xl:text-xl leading-relaxed max-w-sm font-medium">
            Shop from lakhs of products. Trusted by millions. Fast delivery.
          </blockquote>
          <div className="flex gap-3">
            <div className="h-1.5 w-14 rounded-full bg-white/90" />
            <div className="h-1.5 w-14 rounded-full bg-white/25" />
            <div className="h-1.5 w-14 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: ShoppingBag, text: "Wide range of products" },
              { icon: ShieldCheck, text: "Secure checkout" },
              { icon: Truck, text: "Fast & free delivery" },
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

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-[#F9FAFB]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <Link href="/">
              <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
            </Link>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Customer sign in
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/30">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Sign in to your Indovyapar account to continue
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

            <div className="mb-6 flex rounded-xl bg-slate-100/90 p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("phone");
                  setError(null);
                  setDevOtpHint(null);
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                  loginMode === "phone"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("email");
                  setError(null);
                  setDevOtpHint(null);
                  setPhoneStep("number");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                  loginMode === "email"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
            </div>

            {loginMode === "email" ? (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="user-email"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="user-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="user-password"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]/30"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#FF6A00] hover:text-[#E55F00] transition"
                  >
                    Forgot password?
                  </Link>
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
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : phoneStep === "number" ? (
              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div>
                  <label
                    htmlFor="login-phone"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Mobile number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    We&apos;ll send a one-time code by SMS. Enter 10 digits starting with 6–9 (e.g.
                    9876543210). +91 optional.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sendOtpLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                >
                  {sendOtpLoading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <p className="text-sm text-slate-600">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-slate-900">{phone.trim()}</span>
                </p>
                {devOtpHint && (
                  <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200/80">
                    <strong>Development only:</strong> use this code if SMS did not arrive (SNS sandbox, India DLT,
                    or no provider). Your OTP:{" "}
                    <span className="font-mono font-bold tracking-wider">{devOtpHint}</span>
                  </div>
                )}
                <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600 leading-relaxed ring-1 ring-slate-100 space-y-2">
                  <p>
                    On <strong>iPhone</strong>, check <strong>Primary</strong> and{" "}
                    <strong>Transactions</strong> and search for the OTP digits.
                  </p>
                  <p>
                    <strong>AWS SNS</strong> can return a MessageId even when the phone never gets the text.
                    Fix in AWS: <strong>SNS → Text messaging (SMS)</strong> — verify <strong>+91…</strong> in{" "}
                    <strong>sandbox</strong>, raise <strong>spend limit</strong>, or exit sandbox. For{" "}
                    <strong>India</strong>, transactional SMS often needs <strong>DLT</strong>-registered
                    templates and a compliant route; many teams use an India SMS aggregator (e.g. MSG91,
                    Gupshup) or <strong>Amazon Pinpoint</strong> with proper origination — plain SNS to +91 is
                    unreliable until AWS/carrier requirements are met.
                  </p>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-amber-900 bg-amber-50/80 rounded-md px-2 py-1.5 ring-1 ring-amber-200/60">
                      <strong>Local dev:</strong> the OTP appears in the <strong>yellow box above</strong> and in
                      the <strong>terminal</strong> running <code className="text-[11px]">npm run dev</code>.
                    </p>
                  )}
                  {smsTraceId && (
                    <p className="font-mono text-[11px] text-slate-700 break-all">
                      SNS MessageId: {smsTraceId} — use CloudWatch / SNS delivery logs if delivery fails after
                      leaving sandbox.
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="login-otp"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    One-time password
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-center font-mono text-2xl tracking-[0.35em] text-slate-900 placeholder:text-slate-300 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep("number");
                      setOtpCode("");
                      setError(null);
                      setDevOtpHint(null);
                      setSmsTraceId(null);
                    }}
                    className="font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Change number
                  </button>
                  {resendSeconds > 0 ? (
                    <span className="text-slate-500">Resend in {resendSeconds}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void requestOtp()}
                      className="font-semibold text-[#FF6A00] hover:text-[#E55F00]"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifyOtpLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                >
                  {verifyOtpLoading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Verify &amp; sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  or continue with
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Google */}
                <a
                  href={`/api/auth/oauth/google?returnUrl=${encodeURIComponent(returnUrl)}`}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25"
                >
                  {/* Google "G" logo SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </a>

                {/* Facebook */}
                <a
                  href={`/api/auth/oauth/facebook?returnUrl=${encodeURIComponent(returnUrl)}`}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25"
                >
                  {/* Facebook "f" logo SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                      fill="#1877F2"
                    />
                  </svg>
                  Facebook
                </a>
              </div>
            </div>

            <p className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#FF6A00] hover:text-[#E55F00] transition"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push(returnUrl);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold tracking-wide text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              BACK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
