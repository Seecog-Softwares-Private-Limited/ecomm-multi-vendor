"use client";

import { Link } from "../../components/Link";
import { Lock, Eye, EyeOff } from "lucide-react";
import * as React from "react";

export function ModernResetPasswordPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 50, label: "Fair", color: "bg-yellow-500" };
    if (password.length < 12) return { strength: 75, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/modern" className="text-2xl font-bold text-gray-900">
              LUXE
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Reset Password</h1>
            <p className="text-gray-600">
              Create a new password for your account
            </p>
          </div>

          <form className="space-y-6">
            {/* New Password Input */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Password strength</span>
                    <span className={`text-xs font-medium ${
                      strength.strength === 100 ? "text-green-600" :
                      strength.strength === 75 ? "text-blue-600" :
                      strength.strength === 50 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
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

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className={password.length >= 8 ? "text-green-600" : "text-gray-400"}>✓</span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}>✓</span>
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-400"}>✓</span>
                  One number
                </li>
              </ul>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              Reset Password
            </button>
          </form>

          {/* Back to Login */}
          <Link
            href="/modern/login"
            className="block text-center mt-6 text-gray-600 hover:text-gray-900"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
