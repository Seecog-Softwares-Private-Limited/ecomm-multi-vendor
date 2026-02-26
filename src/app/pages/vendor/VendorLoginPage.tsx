"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "../../components/Link";
import { User, Lock, Store } from "lucide-react";
import { authService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.vendorLogin({ email, password });
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof ServiceError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            MarketHub Vendor Center
          </h1>
          <p className="text-sm text-gray-700">Login to manage your store</p>
        </div>

        <div className="bg-white border-2 border-gray-400 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vendor Login</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="vendor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 border-2 border-gray-400" />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
              <Link
                href="/vendor/forgot-password"
                className="text-gray-700 hover:text-gray-900 underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block w-full py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Login to Vendor Center"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-gray-300 text-center">
            <p className="text-sm text-gray-700">
              New to MarketHub?{" "}
              <Link
                href="/vendor/register"
                className="font-bold text-gray-900 underline hover:text-gray-700"
              >
                Register as Vendor
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Are you a customer?{" "}
            <Link
              href="/login"
              className="font-bold text-gray-900 underline hover:text-gray-700"
            >
              Customer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
