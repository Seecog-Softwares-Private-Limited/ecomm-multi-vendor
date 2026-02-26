"use client";

import { Link } from "../components/Link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import * as React from "react";

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E2E8F0] to-[#F8FAFC] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/home" className="text-3xl font-bold text-[#1E293B]">
              ShopHub
            </Link>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-[#16A34A] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>

            <h1 className="text-3xl font-bold text-[#1E293B] mb-3">Check Your Email</h1>
            <p className="text-[#64748B] mb-2">
              We've sent a password reset link to
            </p>
            <p className="font-semibold text-[#1E293B] mb-8">{email}</p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-8">
              <p className="text-sm text-[#64748B]">
                <span className="font-semibold text-[#1E293B]">Didn't receive the email?</span>
                <br />
                Check your spam folder or{" "}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#3B82F6] font-semibold hover:text-[#2563EB] underline"
                >
                  try again
                </button>
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#3B82F6] font-semibold hover:text-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#E2E8F0] to-[#F8FAFC] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/home" className="text-3xl font-bold text-[#1E293B]">
            ShopHub
          </Link>
          <p className="text-[#64748B] mt-2">Secure password recovery</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-[#E2E8F0]">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#3B82F6] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#3B82F6]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#1E293B] mb-3 text-center">
            Forgot Password?
          </h1>
          <p className="text-[#64748B] text-center mb-8">
            No worries! Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all text-[#1E293B] bg-[#F8FAFC] hover:border-[#3B82F6]/50"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <p className="text-sm text-[#64748B]">
                <span className="font-semibold text-[#1E293B]">Security Notice:</span> For your protection, the reset link will expire in 1 hour
              </p>
            </div>

            {/* Send Reset Link Button */}
            <button
              type="submit"
              className="w-full bg-[#3B82F6] text-white py-4 rounded-xl font-semibold hover:bg-[#2563EB] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#64748B]">
            Need help?{" "}
            <Link href="/support-tickets" className="text-[#3B82F6] font-semibold hover:text-[#2563EB]">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
