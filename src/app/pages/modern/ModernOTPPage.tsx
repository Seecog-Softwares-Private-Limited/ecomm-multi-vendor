"use client";

import { Link } from "../../components/Link";
import * as React from "react";

export function ModernOTPPage() {
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = React.useState(30);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a code to{" "}
              <span className="font-medium text-gray-900">your@email.com</span>
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full aspect-square text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-gray-900"
              />
            ))}
          </div>

          {/* Countdown Timer */}
          <div className="text-center mb-6">
            {countdown > 0 ? (
              <p className="text-gray-600">
                Resend code in <span className="font-bold text-gray-900">{countdown}s</span>
              </p>
            ) : (
              <button className="text-gray-900 font-medium hover:text-gray-600">
                Resend Code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg mb-4"
          >
            Verify Email
          </button>

          {/* Back Link */}
          <Link
            href="/modern/register"
            className="block text-center text-gray-600 hover:text-gray-900"
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
