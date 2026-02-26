"use client";

import { Link } from "../components/Link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import * as React from "react";

export function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E2E8F0] to-[#F5F7FA] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/home" className="text-3xl font-bold text-[#0B1220]">
            ShopHub
          </Link>
          <p className="text-[#64748B] mt-2">Welcome back! Please login to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-3xl font-bold text-[#0B1220] mb-2">Sign In</h1>
          <p className="text-[#64748B] mb-8">Enter your credentials to access your account</p>

          <form className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors text-[#0F172A] bg-[#F5F7FA]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors text-[#0F172A] bg-[#F5F7FA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#2563EB] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-sm text-[#64748B]">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#2563EB] font-semibold hover:text-[#1D4ED8]">
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#64748B]">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="py-3 px-4 border-2 border-[#E2E8F0] rounded-xl hover:border-[#2563EB] hover:bg-[#F5F7FA] transition-all font-semibold text-[#0F172A] bg-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </div>
              </button>
              <button
                type="button"
                className="py-3 px-4 border-2 border-[#E2E8F0] rounded-xl hover:border-[#2563EB] hover:bg-[#F5F7FA] transition-all font-semibold text-[#0F172A] bg-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </div>
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-[#64748B]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#2563EB] font-semibold hover:text-[#1D4ED8]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
