"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 border-2 border-gray-800 mb-4">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ADMIN PANEL</h1>
          <p className="text-sm text-gray-600">Multi-Vendor Marketplace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-gray-400 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Admin Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-gray-400"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-gray-900 hover:underline font-bold">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 transition-colors font-bold disabled:opacity-60"
            >
              {loading ? "Logging in…" : "LOGIN"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 MarketHub Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
