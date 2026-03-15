"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Store, Package, TrendingUp } from "lucide-react";
import { authService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

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
  const [loading, setLoading] = useState(false);

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

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00]/30"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  href="/vendor/forgot-password"
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
                    Sign in to Vendor Center
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

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
