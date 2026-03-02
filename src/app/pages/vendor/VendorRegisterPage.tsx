"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "../../components/Link";
import { User, Lock, Store, Building2, UserCircle, Phone } from "lucide-react";
import { authService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";

/**
 * Vendor registration page at /vendor/register.
 * Submits to POST /api/auth/vendor-register and redirects to /vendor on success.
 */
export function VendorRegisterPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-700 border-2 border-gray-800 flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            MarketHub Vendor Center
          </h1>
          <p className="text-sm text-gray-700">Create your vendor account</p>
        </div>

        <div className="bg-white border-2 border-gray-400 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Register as Vendor</h2>

          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-3">
                {verificationLink
                  ? "Registration successful. No email was sent (SMTP not configured). Use the link below to verify your email, then you can log in."
                  : "Registration successful. Please check your email to verify your account. Click the link in the email, then you can log in."}
              </p>
              {verificationLink && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Verification link (click or copy):</p>
                  <a
                    href={verificationLink}
                    className="block text-sm text-blue-600 underline break-all hover:text-blue-800"
                  >
                    {verificationLink}
                  </a>
                </div>
              )}
              <Link
                href="/vendor/login"
                className="block w-full py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold text-center"
              >
                Go to login
              </Link>
            </div>
          ) : (
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
                  minLength={8}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Min 8 characters, with uppercase, lowercase and a number
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Business Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Store Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Owner / Contact Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Phone <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 bg-gray-100 focus:outline-none focus:border-gray-600"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block w-full py-3 bg-gray-700 text-white border-2 border-gray-800 hover:bg-gray-800 font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Register as Vendor"}
            </button>
          </form>
          )}

          <div className="mt-6 pt-6 border-t-2 border-gray-300 text-center">
            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <Link
                href="/vendor/login"
                className="font-bold text-gray-900 underline hover:text-gray-700"
              >
                Login to Vendor Center
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
