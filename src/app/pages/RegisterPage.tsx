"use client";

import { Link } from "../components/Link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  Truck,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGuestCart, clearGuestCart } from "@/lib/guest-cart";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import { dispatchCartUpdated } from "@/contexts/CartDrawerContext";
import { startOAuthLogin } from "@/lib/auth/start-oauth";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT, toMobileInputDigits } from "@/lib/auth/phone";
import { customerNeedsAuthOnboarding } from "@/lib/auth/customer-onboarding-client";
import { isCustomerNativeApp } from "@/lib/native-bridge";

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20";

const btnSecondary =
  "shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#FF6A00]/40 hover:bg-orange-50/50 disabled:pointer-events-none disabled:opacity-50";

/** Left marketing panel — matches customer LoginPage */
function RegisterBrandPanel() {
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
        <Link href="/">
          <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">
          India&apos;s Marketplace
        </p>
      </div>

      <div className="space-y-6 relative z-10">
        <blockquote className="text-white/95 text-lg xl:text-xl leading-relaxed max-w-sm font-medium">
          Join millions who shop on Indovyapar — secure checkout and fast delivery.
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
  );
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl =
    searchParams?.get("returnUrl") ?? searchParams?.get("callbackUrl") ?? "/";
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [emailOtp, setEmailOtp] = React.useState("");
  const [phoneOtp, setPhoneOtp] = React.useState("");
  const [emailSent, setEmailSent] = React.useState(false);
  const [phoneSent, setPhoneSent] = React.useState(false);
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [phoneVerified, setPhoneVerified] = React.useState(false);
  const [emailProofToken, setEmailProofToken] = React.useState<string | null>(null);
  const [phoneProofToken, setPhoneProofToken] = React.useState<string | null>(null);
  const [emailCooldown, setEmailCooldown] = React.useState(0);
  const [phoneCooldown, setPhoneCooldown] = React.useState(0);
  const [emailSendLoading, setEmailSendLoading] = React.useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = React.useState(false);
  const [phoneSendLoading, setPhoneSendLoading] = React.useState(false);
  const [phoneVerifyLoading, setPhoneVerifyLoading] = React.useState(false);
  const [isCustomerApp, setIsCustomerApp] = React.useState(false);

  // Customer register must stay on customer flow (Google visible).
  // Sticky app=1 was blanking this page for Safari/iPad after vendor WebView visits.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__INDOVYAPAR_NATIVE__) {
      router.replace("/vendor/login?app=1");
      return;
    }
    setIsCustomerApp(isCustomerNativeApp());
    try {
      window.sessionStorage.removeItem("indovyapar-app-mode");
    } catch {
      /* ignore */
    }
  }, [router]);

  React.useEffect(() => {
    if (emailCooldown <= 0) return;
    const t = setInterval(() => setEmailCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [emailCooldown]);

  React.useEffect(() => {
    if (phoneCooldown <= 0) return;
    const t = setInterval(() => setPhoneCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phoneCooldown]);

  const onEmailChange = (v: string) => {
    setEmail(v);
    if (emailVerified || emailProofToken || emailSent) {
      setEmailVerified(false);
      setEmailProofToken(null);
      setEmailSent(false);
      setEmailOtp("");
    }
  };

  const onPhoneChange = (v: string) => {
    setPhone(toMobileInputDigits(v, 10));
    if (phoneVerified || phoneProofToken || phoneSent) {
      setPhoneVerified(false);
      setPhoneProofToken(null);
      setPhoneSent(false);
      setPhoneOtp("");
    }
  };

  const sendEmailOtp = async (isResend = false) => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setEmailSendLoading(true);
    try {
      const res = await fetch("/api/auth/register/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, ...(isResend ? { resend: true } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not send email OTP.");
        return;
      }
      setEmailSent(true);
      setEmailVerified(false);
      setEmailProofToken(null);
      setEmailOtp("");
      setEmailCooldown(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setEmailSendLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(emailOtp.trim())) {
      setError("Enter the 6-digit email OTP.");
      return;
    }
    setEmailVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/register/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: emailOtp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Invalid or expired email OTP.");
        return;
      }
      const token = data?.data?.emailProofToken;
      if (typeof token !== "string") {
        setError("Email verification failed. Try again.");
        return;
      }
      setEmailProofToken(token);
      setEmailVerified(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const sendPhoneOtp = async (isResend = false) => {
    setError(null);
    const trimmed = phone.trim();
    if (!normalizeIndianPhone(trimmed)) {
      setError(INDIAN_MOBILE_HINT);
      return;
    }
    setPhoneSendLoading(true);
    try {
      const res = await fetch("/api/auth/register/phone-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed, ...(isResend ? { resend: true } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Could not send phone OTP.");
        return;
      }
      setPhoneSent(true);
      setPhoneVerified(false);
      setPhoneProofToken(null);
      setPhoneOtp("");
      setPhoneCooldown(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPhoneSendLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(phoneOtp.trim())) {
      setError("Enter the 6-digit phone OTP.");
      return;
    }
    setPhoneVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/register/phone-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: phoneOtp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Invalid or expired phone OTP.");
        return;
      }
      const token = data?.data?.phoneProofToken;
      if (typeof token !== "string") {
        setError("Phone verification failed. Try again.");
        return;
      }
      setPhoneProofToken(token);
      setPhoneVerified(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPhoneVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError("Email is required.");
      return;
    }
    if (!emailVerified || !emailProofToken) {
      setError("Please verify your email with OTP before creating an account.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters and contain uppercase, lowercase, and a number.");
      return;
    }
    if (!isCustomerApp) {
      if (!phone.trim() || !normalizeIndianPhone(phone.trim())) {
        setError(INDIAN_MOBILE_HINT);
        return;
      }
      if (!phoneVerified || !phoneProofToken) {
        setError("Please verify your phone with OTP before creating an account.");
        return;
      }
    } else if (phone.trim()) {
      // Optional on Customer App — if provided, must be verified.
      if (!normalizeIndianPhone(phone.trim())) {
        setError(INDIAN_MOBILE_HINT);
        return;
      }
      if (!phoneVerified || !phoneProofToken) {
        setError("Please verify your phone with OTP, or leave it blank for now.");
        return;
      }
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || undefined;

    setLoading(true);
    try {
      if (isCustomerApp) {
        await fetch("/api/auth/customer-app/marker", {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
      }
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          ...(phone.trim() && phoneVerified && phoneProofToken
            ? { phone: phone.trim(), phoneProofToken }
            : isCustomerApp
              ? {}
              : { phone: phone.trim(), phoneProofToken }),
          emailProofToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "Registration failed. Please try again.");
        return;
      }
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
        dispatchCartUpdated();
      }
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = meRes.ok ? await meRes.json().catch(() => null) : null;
      if (customerNeedsAuthOnboarding(meData?.data?.user)) {
        router.push("/complete-profile");
        return;
      }
      router.push(returnUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const emailFormatOk = isValidEmail(email);
  const phoneFormatOk = Boolean(normalizeIndianPhone(phone.trim()));

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <RegisterBrandPanel />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-[#F9FAFB]">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <Link href="/">
              <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
            </Link>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Create your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/30">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create account</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Verify your email and phone with OTP, then create your Indovyapar account
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

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-name"
                    type="text"
                    name="fullName"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className={`${inputClass} pl-12 pr-4`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700">
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      autoComplete="email"
                      disabled={emailVerified}
                      required
                      className={`${inputClass} pl-12 pr-4 disabled:opacity-70`}
                    />
                  </div>
                  <button
                    type="button"
                    className={btnSecondary}
                    disabled={
                      emailVerified ||
                      !emailFormatOk ||
                      emailCooldown > 0 ||
                      emailSendLoading
                    }
                    onClick={() => void sendEmailOtp(emailSent)}
                  >
                    {emailSendLoading
                      ? "…"
                      : emailVerified
                        ? "Verified"
                        : emailCooldown > 0
                          ? `Resend in ${emailCooldown}s`
                          : emailSent
                            ? "Resend OTP"
                            : "Send OTP"}
                  </button>
                </div>
                {emailSent && !emailVerified ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit OTP"
                      value={emailOtp}
                      onChange={(e) =>
                        setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className={`${inputClass} flex-1 px-4 tracking-widest`}
                    />
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={emailOtp.length !== 6 || emailVerifyLoading || emailVerified}
                      onClick={() => void verifyEmailOtp()}
                    >
                      {emailVerifyLoading ? "…" : "Verify OTP"}
                    </button>
                  </div>
                ) : null}
                {emailVerified ? (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Email verified
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="8+ chars, upper, lower, number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pl-12 pr-12`}
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

              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pl-12 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700">
                  Phone{" "}
                  {isCustomerApp ? (
                    <span className="font-normal text-slate-500">(optional)</span>
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reg-phone"
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      disabled={phoneVerified}
                      className={`${inputClass} pl-12 pr-4 disabled:opacity-70`}
                    />
                  </div>
                  <button
                    type="button"
                    className={btnSecondary}
                    disabled={
                      phoneVerified ||
                      !phoneFormatOk ||
                      phoneCooldown > 0 ||
                      phoneSendLoading
                    }
                    onClick={() => void sendPhoneOtp(phoneSent)}
                  >
                    {phoneSendLoading
                      ? "…"
                      : phoneVerified
                        ? "Verified"
                        : phoneCooldown > 0
                          ? `Resend in ${phoneCooldown}s`
                          : phoneSent
                            ? "Resend OTP"
                            : "Send OTP"}
                  </button>
                </div>
                {phoneSent && !phoneVerified ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit OTP"
                      value={phoneOtp}
                      onChange={(e) =>
                        setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className={`${inputClass} flex-1 px-4 tracking-widest`}
                    />
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={phoneOtp.length !== 6 || phoneVerifyLoading || phoneVerified}
                      onClick={() => void verifyPhoneOtp()}
                    >
                      {phoneVerifyLoading ? "…" : "Verify OTP"}
                    </button>
                  </div>
                ) : null}
                {phoneVerified ? (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Phone verified
                  </p>
                ) : null}
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]/30"
                />
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <Link href="#" className="font-semibold text-[#FF6A00] hover:text-[#E55F00] transition">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="font-semibold text-[#FF6A00] hover:text-[#E55F00] transition">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !emailVerified || !phoneVerified}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative pt-1">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="oauth-social-grid grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => startOAuthLogin("google", returnUrl)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:border-[#FF6A00]/30 hover:bg-slate-50/80"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </form>

            <p className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#FF6A00] hover:text-[#E55F00] transition">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/vendor/login" className="hover:text-slate-700 transition">
              Are you a vendor? Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
