"use client";

import { Link } from "../../../components/Link";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import * as React from "react";

export function ModernRegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h2 className="text-5xl font-bold mb-4">Join LUXE</h2>
            <p className="text-xl text-gray-300">Create an account to start your premium shopping experience</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link href="/modern" className="text-3xl font-bold text-gray-900">
              LUXE
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h1>
          <p className="text-gray-600 mb-8">Join us to discover exclusive products</p>

          <form className="space-y-6">
            {/* Full Name Input */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Full name"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-gray-900"
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-gray-900"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="#" className="text-gray-900 font-medium hover:text-gray-600">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-gray-900 font-medium hover:text-gray-600">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              Create Account
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-colors font-medium text-gray-900"
              >
                Google
              </button>
              <button
                type="button"
                className="py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-colors font-medium text-gray-900"
              >
                Facebook
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/modern/login" className="text-gray-900 font-medium hover:text-gray-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
