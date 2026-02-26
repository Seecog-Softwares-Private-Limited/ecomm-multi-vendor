"use client";

import { Link } from "../components/Link";
import { Lock, Eye, EyeOff, Check, X, Shield } from "lucide-react";
import * as React from "react";

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Password strength calculation
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-[#DC2626]";
    if (passwordStrength <= 50) return "bg-[#F59E0B]";
    if (passwordStrength <= 75) return "bg-[#EAB308]";
    return "bg-[#16A34A]";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  // Password requirements
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase & lowercase", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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
          <p className="text-[#64748B] mt-2">Create a secure new password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-[#E2E8F0]">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#3B82F6] bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[#3B82F6]" />
          </div>

          <h1 className="text-3xl font-bold text-[#1E293B] mb-3 text-center">
            Reset Password
          </h1>
          <p className="text-[#64748B] text-center mb-8">
            Choose a strong password to secure your account
          </p>

          <form className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-4 border-2 border-[#E2E8F0] rounded-xl focus:border-[#3B82F6] focus:outline-none transition-all text-[#1E293B] bg-[#F8FAFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#3B82F6] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#64748B]">Password Strength:</span>
                    <span className={`text-sm font-bold ${
                      passwordStrength <= 25 ? "text-[#DC2626]" :
                      passwordStrength <= 50 ? "text-[#F59E0B]" :
                      passwordStrength <= 75 ? "text-[#EAB308]" :
                      "text-[#16A34A]"
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300 rounded-full`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1E293B] mb-3">Password must contain:</p>
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {req.met ? (
                        <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                      )}
                      <span className={`text-sm ${req.met ? "text-[#16A34A]" : "text-[#64748B]"}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all text-[#1E293B] bg-[#F8FAFC] ${
                    confirmPassword
                      ? passwordsMatch
                        ? "border-[#16A34A] focus:border-[#16A34A]"
                        : "border-[#DC2626] focus:border-[#DC2626]"
                      : "border-[#E2E8F0] focus:border-[#3B82F6]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#3B82F6] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`mt-2 text-sm font-medium ${passwordsMatch ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                  {passwordsMatch ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" /> Passwords match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="w-4 h-4" /> Passwords don't match
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-[#3B82F6] bg-opacity-5 border border-[#3B82F6] border-opacity-20 rounded-xl p-4">
              <p className="text-sm text-[#1E293B]">
                <span className="font-semibold">Security Tip:</span> Use a unique password that you don't use on other websites
              </p>
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={!passwordsMatch || passwordStrength < 50}
              className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg ${
                passwordsMatch && passwordStrength >= 50
                  ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-[#E2E8F0] text-[#64748B] cursor-not-allowed"
              }`}
            >
              Reset Password
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-[#64748B] hover:text-[#1E293B] transition-colors font-medium text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
