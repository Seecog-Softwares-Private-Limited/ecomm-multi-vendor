"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { authService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";

export type AdminLoginPageProps = {
  onSuccess?: () => void;
};

/**
 * Admin login at /admin/login.
 * Submits to POST /api/auth/admin-login and redirects to /admin or callbackUrl on success.
 */
export function AdminLoginPage({ onSuccess }: AdminLoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.adminLogin({ email, password });
      onSuccess?.();
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof ServiceError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 xl:p-14">
        <div>
          <div className="flex items-center gap-3 text-white/95">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 backdrop-blur-sm ring-1 ring-amber-400/30">
              <ShieldCheck className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Admin Panel</span>
          </div>
        </div>
        <div className="space-y-6">
          <blockquote className="text-slate-300 text-lg xl:text-xl leading-relaxed max-w-sm">
            “Manage vendors, orders, and catalog from one secure dashboard.”
          </blockquote>
          <div className="flex gap-4">
            <div className="h-1 w-12 rounded-full bg-amber-400" />
            <div className="h-1 w-12 rounded-full bg-white/20" />
            <div className="h-1 w-12 rounded-full bg-white/10" />
          </div>
        </div>
        <p className="text-sm text-slate-500">© Admin. Secure access only.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-10 bg-slate-50/80">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-amber-400 shadow-lg ring-1 ring-slate-700 mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Admin Panel</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to the admin dashboard</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Admin sign in
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Use your admin account to continue
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
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/30"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-amber-700 hover:text-amber-800 transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Sign in to Admin
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Authorized personnel only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
