"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Store, Package, TrendingUp } from "lucide-react";
import { authService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import {
  APPLE_AUTH_RESULT_MESSAGE,
  startVendorAppleLogin,
  startVendorOAuthLogin,
} from "@/lib/auth/start-oauth";
import {
  canUseNativeAppleSignIn,
  hasNativeBridge,
  subscribeToNative,
  type AppleAuthResultPayload,
} from "@/lib/native-bridge";
import { useAppMode } from "@/contexts/AppModeContext";

const APPLE_AUTH_TIMEOUT_MS = 45_000;

function isLikelyNativeIosShell(): boolean {
  if (typeof window === "undefined" || !hasNativeBridge()) return false;
  const caps = window.__INDOVYAPAR_NATIVE__;
  if (caps?.platform === "ios") return true;
  const ua = window.navigator?.userAgent ?? "";
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (ua.includes("Mac") && "ontouchend" in document)
  );
}

/**
 * Vendor login page at /vendor/login.
 * Submits to POST /api/auth/vendor-login and redirects to /vendor or callbackUrl on success.
 */
export function VendorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/vendor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  // Sync init — avoid first paint with Google and no Apple on iOS (Guideline 4.8).
  const [showAppleSignIn, setShowAppleSignIn] = useState(() => canUseNativeAppleSignIn());
  const [socialReady, setSocialReady] = useState(() => !isLikelyNativeIosShell());
  const appleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applePendingRef = useRef(false);
  const { isAppMode } = useAppMode();

  function clearAppleTimeout() {
    if (appleTimeoutRef.current) {
      clearTimeout(appleTimeoutRef.current);
      appleTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    const oauthErr = searchParams.get("error")?.trim();
    if (oauthErr) setError(oauthErr);
    if (searchParams.get("deactivated") === "1") {
      setSuccessMessage(
        "Your vendor account has been deactivated. Contact support to reactivate."
      );
    }
    if (searchParams.get("deleted") === "1") {
      setSuccessMessage(
        "Your account has been permanently deleted. All personal data has been removed."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const refreshAppleAvailability = () => {
      const available = canUseNativeAppleSignIn();
      setShowAppleSignIn(available);
      if (!isLikelyNativeIosShell() || available) {
        setSocialReady(true);
      }
    };
    refreshAppleAvailability();
    const id = window.setInterval(refreshAppleAvailability, 250);
    const stop = window.setTimeout(() => {
      window.clearInterval(id);
      // On iOS native, never unlock Google alone — keep waiting until Apple is known.
      if (canUseNativeAppleSignIn() || !isLikelyNativeIosShell()) {
        setSocialReady(true);
      } else {
        setShowAppleSignIn(true);
        setSocialReady(true);
      }
    }, 2500);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, []);

  const oauthReturnUrl = (() => {
    if (!isAppMode) return callbackUrl;
    try {
      const u = new URL(callbackUrl, "https://indovyapar.com");
      if (!u.searchParams.has("app")) u.searchParams.set("app", "1");
      return `${u.pathname}${u.search}`;
    } catch {
      return callbackUrl.includes("app=")
        ? callbackUrl
        : `${callbackUrl}${callbackUrl.includes("?") ? "&" : "?"}app=1`;
    }
  })();

  useEffect(() => {
    const onResult = (payload: AppleAuthResultPayload | undefined) => {
      void handleAppleNativeResult(payload);
    };
    window.__INDOVYAPAR_ON_APPLE_AUTH_RESULT__ = onResult;
    const unsubscribe = subscribeToNative((message) => {
      if (message.type !== "custom" || message.name !== APPLE_AUTH_RESULT_MESSAGE) return;
      onResult(message.payload as AppleAuthResultPayload | undefined);
    });
    return () => {
      if (window.__INDOVYAPAR_ON_APPLE_AUTH_RESULT__ === onResult) {
        delete window.__INDOVYAPAR_ON_APPLE_AUTH_RESULT__;
      }
      unsubscribe();
      clearAppleTimeout();
      applePendingRef.current = false;
    };
  }, [callbackUrl, router]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // Never let a hung request trap the user on a full-screen spinner — show the
    // login form after 8s regardless (App Store Guideline 2.1 — no dead states).
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch("/api/vendor/me", { credentials: "include", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (json?.success && json.data) {
          router.replace(callbackUrl);
        }
      })
      .catch(() => {
        /* stay on login */
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [callbackUrl, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.vendorLogin({ email, password });
      await new Promise((r) => setTimeout(r, 50));
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof ServiceError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleNativeResult(payload: AppleAuthResultPayload | undefined) {
    applePendingRef.current = false;
    clearAppleTimeout();

    if (!payload) {
      setAppleLoading(false);
      setError("Apple sign-in failed. Please try again.");
      return;
    }
    if (!payload.success) {
      setAppleLoading(false);
      if (payload.cancelled) {
        setError(null);
        return;
      }
      setError(payload.message || "Apple sign-in failed. Please try again.");
      return;
    }

    setError(null);
    setAppleLoading(true);
    try {
      await authService.vendorAppleLogin({
        identityToken: payload.identityToken,
        nonce: payload.nonce,
        authorizationCode: payload.authorizationCode,
        user: payload.user,
        email: payload.email,
        fullName: payload.fullName,
      });
      await new Promise((r) => setTimeout(r, 50));
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof ServiceError ? err.message : "Apple sign-in failed");
    } finally {
      setAppleLoading(false);
    }
  }

  function handleAppleClick() {
    setError(null);
    if (!canUseNativeAppleSignIn()) {
      setError("Sign in with Apple is available in the IndoVyapar Vendor iOS app.");
      return;
    }
    applePendingRef.current = true;
    setAppleLoading(true);
    clearAppleTimeout();
    appleTimeoutRef.current = setTimeout(() => {
      if (!applePendingRef.current) return;
      applePendingRef.current = false;
      setAppleLoading(false);
      setError("Apple sign-in timed out. Please try again.");
    }, APPLE_AUTH_TIMEOUT_MS);

    const started = startVendorAppleLogin(oauthReturnUrl);
    if (!started) {
      applePendingRef.current = false;
      clearAppleTimeout();
      setAppleLoading(false);
      setError("Sign in with Apple is available in the IndoVyapar Vendor iOS app.");
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
      </div>
    );
  }

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
          <IndovyaparLogo variant="light" style={{ fontSize: 28, lineHeight: "32px" }} />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/80">
            Vendor Center
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <blockquote className="text-white/95 text-lg xl:text-xl leading-relaxed max-w-sm font-medium">
            One place to manage inventory, orders, and payouts. Simple and fast.
          </blockquote>
          <div className="flex gap-3">
            <div className="h-1.5 w-14 rounded-full bg-white/90" />
            <div className="h-1.5 w-14 rounded-full bg-white/25" />
            <div className="h-1.5 w-14 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: Package, text: "Manage products & inventory" },
              { icon: Store, text: "Orders & fulfillment" },
              { icon: TrendingUp, text: "Earnings & payouts" },
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

        <p className="text-sm text-white/50 relative z-10">Sell on Indovyapar</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-[#F9FAFB]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <IndovyaparLogo fontSize={26} style={{ lineHeight: "32px" }} />
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Vendor sign in
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/30">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Sign in to your vendor account to continue
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {successMessage && (
                <div
                  className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200/80"
                  role="status"
                >
                  {successMessage}
                </div>
              )}

              {error && (
                <div
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/80"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="vendor-email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="vendor-email"
                    type="email"
                    autoComplete="email"
                    placeholder="vendor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="vendor-password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="vendor-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-end">
                <Link
                  href="/vendor/forgot-password"
                  className="text-sm font-semibold text-[#FF6A00] hover:text-[#E55F00] transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || appleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Sign in to Vendor Center
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                  or continue with
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {!socialReady ? (
                <div className="mt-4 flex justify-center py-3">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                </div>
              ) : (
                <>
                  {showAppleSignIn ? (
                    <button
                      type="button"
                      onClick={handleAppleClick}
                      disabled={loading || appleLoading}
                      aria-label="Continue with Apple"
                      className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black/30 disabled:pointer-events-none disabled:opacity-60"
                    >
                      {appleLoading ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 shrink-0 fill-current"
                            aria-hidden="true"
                          >
                            <path d="M16.365 1.43c0 1.14-.42 2.2-1.18 3.02-.78.86-2.06 1.52-3.18 1.43-.12-1.1.42-2.26 1.16-3.08.78-.86 2.14-1.5 3.2-1.37zM20.48 17.24c-.54 1.24-.8 1.8-1.5 2.9-.98 1.52-2.36 3.4-4.08 3.42-1.52.02-1.92-.98-4-.98-2.1 0-2.54.96-4.06.98-1.74.04-3.06-1.64-4.04-3.16-2.76-4.24-3.04-9.22-1.34-11.86 1.2-1.86 3.1-2.96 4.88-2.96 1.82 0 2.96 1 4.46 1 1.46 0 2.36-1 4.46-1 1.56 0 3.22.84 4.4 2.3-3.86 2.12-3.24 7.64.82 9.36z" />
                          </svg>
                          Continue with Apple
                        </>
                      )}
                    </button>
                  ) : null}

                  {/* On iOS native shell, never show Google without Apple (Guideline 4.8). */}
                  {!isLikelyNativeIosShell() || showAppleSignIn ? (
                    <button
                      type="button"
                      onClick={() => startVendorOAuthLogin("google", oauthReturnUrl)}
                      disabled={loading || appleLoading}
                      className={`${showAppleSignIn ? "mt-3" : "mt-4"} flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 disabled:pointer-events-none disabled:opacity-60`}
                    >
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
                      Continue with Google
                    </button>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                New here?{" "}
                <Link
                  href="/vendor/register"
                  className="font-semibold text-[#FF6A00] hover:text-[#E55F00] transition"
                >
                  Register as vendor
                </Link>
              </p>
            </div>
          </div>

          {!isAppMode ? (
            <p className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Are you a customer? Sign in here
              </Link>
            </p>
          ) : (
            <p className="mt-8 text-center text-xs text-slate-400">
              <a href="/info/privacy-policy?app=1" className="hover:text-slate-600 hover:underline">
                Privacy Policy
              </a>
              <span className="mx-2">·</span>
              <a href="/info/terms-of-service?app=1" className="hover:text-slate-600 hover:underline">
                Terms
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
