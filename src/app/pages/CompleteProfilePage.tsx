"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, User, LogOut } from "lucide-react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import { toast } from "sonner";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";
import {
  type CustomerAuthMeUser,
  type CustomerOnboardingStep,
  customerNeedsAuthOnboarding,
  resolveCustomerOnboardingStep,
} from "@/lib/auth/customer-onboarding-client";

type PhoneOtpPhase = "number" | "otp";

export function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<CustomerAuthMeUser | null>(null);
  const [step, setStep] = React.useState<CustomerOnboardingStep>("done");

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submittingProfile, setSubmittingProfile] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [devVerifyLink, setDevVerifyLink] = React.useState<string | null>(null);
  const [emailAwaitMessage, setEmailAwaitMessage] = React.useState<string | null>(null);

  const [phone, setPhone] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [phonePhase, setPhonePhase] = React.useState<PhoneOtpPhase>("number");
  const [sendOtpLoading, setSendOtpLoading] = React.useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = React.useState(false);
  const [resendSeconds, setResendSeconds] = React.useState(0);
  const [formError, setFormError] = React.useState<string | null>(null);

  const refreshMe = React.useCallback(async (): Promise<CustomerAuthMeUser | null> => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const json = res.ok ? await res.json().catch(() => null) : null;
    const me = (json?.data?.user ?? null) as CustomerAuthMeUser | null;
    if (!me) return null;
    setUser(me);
    const next = resolveCustomerOnboardingStep(me);
    setStep(next);
    if (next === "done") {
      router.replace("/");
    }
    return me;
  }, [router]);

  React.useEffect(() => {
    (async () => {
      try {
        const me = await refreshMe();
        if (!me) {
          router.replace("/login?callbackUrl=/complete-profile");
          return;
        }
        if (!customerNeedsAuthOnboarding(me)) {
          router.replace("/");
          return;
        }
        setFullName([me.firstName, me.lastName].filter(Boolean).join(" ").trim());
        if (me.email && !me.email.includes("@phone-otp.indovyapar.local")) {
          setEmail(me.email);
        }
        if (me.phone) setPhone(me.phone.replace(/^91/, ""));
      } catch {
        toast.error("Could not load your profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe, router]);

  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/login");
  };

  const requestOtp = async (isResend = false) => {
    setFormError(null);
    const trimmed = phone.trim();
    if (!trimmed) {
      setFormError("Please enter your mobile number.");
      return;
    }
    if (!normalizeIndianPhone(trimmed)) {
      setFormError(INDIAN_MOBILE_HINT);
      return;
    }
    setSendOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: trimmed, ...(isResend ? { resend: true } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error?.message ?? "Could not send OTP. Try again.");
        return;
      }
      setPhonePhase("otp");
      setOtpCode("");
      setResendSeconds(60);
      toast.success("OTP sent to your mobile.");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSendOtpLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setFormError("Enter the 6-digit code from your SMS.");
      return;
    }
    setVerifyOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.trim(), otp: otpCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error?.message ?? "Invalid or expired code.");
        return;
      }
      toast.success("Phone verified.");
      await refreshMe();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const submitNameEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const name = fullName.trim();
    const mail = email.trim().toLowerCase();
    if (!name) {
      setFormError("Full name is required.");
      return;
    }
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    setSubmittingProfile(true);
    try {
      const res = await fetch("/api/auth/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email: mail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error?.message ?? "Could not save your details.");
        return;
      }
      if (data?.data?.verificationLink) {
        setDevVerifyLink(data.data.verificationLink as string);
      }
      setEmailAwaitMessage(
        data?.data?.message ??
          "Check your email and confirm your address using the link we sent."
      );
      setStep("await_email_verification");
      setEmail(mail);
      toast.success("Check your email to verify your address.");
      await refreshMe();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const resendVerification = async () => {
    const mail = email.trim() || user?.email;
    if (!mail || mail.includes("@phone-otp.indovyapar.local")) {
      toast.error("Enter your email first.");
      return;
    }
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-customer-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Could not resend email.");
        return;
      }
      toast.success(data?.data?.message ?? "If pending, a new link was sent.");
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B7A43]" />
      </div>
    );
  }

  const title =
    step === "phone_otp"
      ? "Verify your phone"
      : step === "await_email_verification"
        ? "Check your email"
        : "Complete your account";

  const subtitle =
    step === "phone_otp"
      ? "Add and verify your phone number to finish setting up your account."
      : step === "await_email_verification"
        ? "Email verification required. Open the link we sent to finish setup."
        : "Your phone number has already been verified. Verify your email to finish setting up your account.";

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <IndovyaparLogo className="h-8" />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

          {formError ? (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {formError}
            </p>
          ) : null}

          {step === "phone_otp" && phonePhase === "number" ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void requestOtp();
              }}
            >
              <label className="block text-sm font-medium text-slate-700">
                Mobile number <span className="text-red-500">*</span>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    autoComplete="tel"
                    disabled={sendOtpLoading}
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={sendOtpLoading}
                className="w-full py-3 rounded-xl bg-[#1B7A43] text-white font-semibold hover:bg-[#135C32] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sendOtpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Send OTP
              </button>
            </form>
          ) : null}

          {step === "phone_otp" && phonePhase === "otp" ? (
            <form className="mt-6 space-y-4" onSubmit={verifyOtp}>
              <p className="text-sm text-slate-600">
                Enter the 6-digit code sent to <strong>{phone}</strong>.
              </p>
              <label className="block text-sm font-medium text-slate-700">
                OTP
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 tracking-widest text-center text-lg"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  disabled={verifyOtpLoading}
                />
              </label>
              <button
                type="submit"
                disabled={verifyOtpLoading}
                className="w-full py-3 rounded-xl bg-[#1B7A43] text-white font-semibold hover:bg-[#135C32] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {verifyOtpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Verify phone
              </button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-slate-600 hover:underline"
                  onClick={() => {
                    setPhonePhase("number");
                    setOtpCode("");
                    setFormError(null);
                  }}
                >
                  Change number
                </button>
                <button
                  type="button"
                  disabled={resendSeconds > 0 || sendOtpLoading}
                  className="text-[#1B7A43] font-medium disabled:text-slate-400"
                  onClick={() => void requestOtp(true)}
                >
                  {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          ) : null}

          {step === "name_email" ? (
            <form className="mt-6 space-y-4" onSubmit={submitNameEmail}>
              <label className="block text-sm font-medium text-slate-700">
                Full name <span className="text-red-500">*</span>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    disabled={submittingProfile}
                  />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email address <span className="text-red-500">*</span>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    disabled={submittingProfile}
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={submittingProfile}
                className="w-full py-3 rounded-xl bg-[#1B7A43] text-white font-semibold hover:bg-[#135C32] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submittingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Continue
              </button>
            </form>
          ) : null}

          {step === "await_email_verification" ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-slate-600">
                {emailAwaitMessage ??
                  `We sent a verification link to ${email || user?.email || "your email"}.`}
              </p>
              {devVerifyLink ? (
                <p className="text-xs break-all text-slate-500">
                  Dev link:{" "}
                  <a className="text-[#1B7A43] underline" href={devVerifyLink}>
                    {devVerifyLink}
                  </a>
                </p>
              ) : null}
              <button
                type="button"
                disabled={resendLoading}
                onClick={() => void resendVerification()}
                className="w-full py-3 rounded-xl border border-slate-300 text-slate-800 font-medium hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resendLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Resend verification email
              </button>
              <button
                type="button"
                onClick={() => void refreshMe()}
                className="w-full py-3 rounded-xl bg-[#1B7A43] text-white font-semibold hover:bg-[#135C32]"
              >
                I&apos;ve verified my email
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
