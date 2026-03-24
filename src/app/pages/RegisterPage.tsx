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
} from "lucide-react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGuestCart, clearGuestCart } from "@/lib/guest-cart";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20";

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
        <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
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

export function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(null);
  const [registerInfo, setRegisterInfo] = React.useState<string | null>(null);
  const [devVerifyLink, setDevVerifyLink] = React.useState<string | null>(null);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);
  const resendAbortRef = React.useRef<AbortController | null>(null);

  /** Avoid stuck "Sending…" after refresh/HMR or a dropped request */
  React.useEffect(() => {
    if (registeredEmail) {
      setResendLoading(false);
      resendAbortRef.current?.abort();
      resendAbortRef.current = null;
    }
  }, [registeredEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Email is required.");
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
    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || undefined;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message ?? "Registration failed. Please try again.";
        setError(msg);
        return;
      }
      if (data?.data?.needsEmailVerification) {
        setRegisteredEmail(trimmedEmail);
        setRegisterInfo(data.data.message ?? "Check your email to confirm your sign-up.");
        setDevVerifyLink(
          typeof data.data.verificationLink === "string" ? data.data.verificationLink : null
        );
        setResendMessage(null);
        return;
      }
      const returnUrl = searchParams?.get("returnUrl") ?? "/";
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
      router.push(returnUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RESEND_FETCH_MS = 25_000;

  const handleResend = async () => {
    if (!registeredEmail || resendLoading) return;
    resendAbortRef.current?.abort();
    const controller = new AbortController();
    resendAbortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), RESEND_FETCH_MS);

    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await fetch("/api/auth/resend-customer-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: registeredEmail }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let json: Record<string, unknown> = {};
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        try {
          json = (await res.json()) as Record<string, unknown>;
        } catch {
          json = {};
        }
      }

      const data = json?.data as { message?: string } | undefined;
      const msgFromApi = typeof data?.message === "string" ? data.message : undefined;

      if (res.ok) {
        setResendMessage(
          msgFromApi ??
            "If this email has a pending account, we sent a new confirmation link. Check your inbox."
        );
      } else {
        const errMsg =
          (json?.error as { message?: string } | undefined)?.message ??
          "Could not resend. Try again.";
        setResendMessage(errMsg);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const aborted = err instanceof DOMException && err.name === "AbortError";
      setResendMessage(
        aborted
          ? "Request timed out. Check your connection and try again."
          : "Could not resend. Try again."
      );
    } finally {
      clearTimeout(timeoutId);
      if (resendAbortRef.current === controller) {
        resendAbortRef.current = null;
      }
      setResendLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen flex bg-[#F9FAFB]">
        <RegisterBrandPanel />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-[#F9FAFB]">
          <div className="w-full max-w-[400px]">
            <div className="lg:hidden flex flex-col items-center text-center mb-10">
              <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Check your email
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/30 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-100">
                <Mail className="h-7 w-7 text-[#FF6A00]" aria-hidden />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Confirm your email</h1>
              <p className="mt-3 text-sm text-slate-600">
                We sent a message to{" "}
                <strong className="text-slate-900">{registeredEmail}</strong>.
              </p>
              {registerInfo && <p className="mt-2 text-sm text-slate-500">{registerInfo}</p>}
              <p className="mt-4 text-sm text-slate-600">
                Open the link in that email to confirm you want to sign up. Then you can sign in.
              </p>
              {devVerifyLink && (
                <div className="mt-5 rounded-xl bg-amber-50 p-3 text-left text-xs break-all ring-1 ring-amber-200/80">
                  <strong className="text-amber-900">Dev only:</strong>{" "}
                  <a href={devVerifyLink} className="font-medium text-[#FF6A00] underline hover:text-[#E55F00]">
                    {devVerifyLink}
                  </a>
                </div>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:border-[#FF6A00]/40 hover:bg-orange-50/50 disabled:opacity-60"
              >
                {resendLoading ? "Sending…" : "Resend confirmation email"}
              </button>
              {resendMessage && <p className="mt-3 text-sm text-slate-500">{resendMessage}</p>}
              <button
                type="button"
                onClick={goToLogin}
                className="mt-6 w-full text-center text-sm font-semibold text-[#FF6A00] hover:text-[#E55F00] transition underline-offset-2 hover:underline"
              >
                Back to sign in
              </button>
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

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <RegisterBrandPanel />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-[#F9FAFB]">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Create your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/30">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create account</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Sign up for Indovyapar — we&apos;ll email you to confirm before you can sign in
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
                <label htmlFor="reg-fullname" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-fullname"
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

              <div>
                <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={`${inputClass} pl-12 pr-4`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className={`${inputClass} pl-12 pr-4`}
                  />
                </div>
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
                disabled={loading}
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

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
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
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:border-[#FF6A00]/30 hover:bg-slate-50/80"
                >
                  <svg className="h-5 w-5 shrink-0" fill="#1877F2" viewBox="0 0 24 24" aria-hidden>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
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
