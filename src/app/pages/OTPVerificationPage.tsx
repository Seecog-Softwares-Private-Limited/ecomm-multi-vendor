"use client";

import { Link } from "../components/Link";
import * as React from "react";

export function OTPVerificationPage() {
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = React.useState(60);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E2E8F0] to-[#F5F7FA] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/home" className="text-3xl font-bold text-[#0B1220]">
            ShopHub
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-[#2563EB] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#0B1220] mb-3">Verify Your Email</h1>
          <p className="text-[#64748B] mb-8">
            We've sent a 6-digit code to<br />
            <span className="font-semibold text-[#0F172A]">your@email.com</span>
          </p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-[#E2E8F0] rounded-xl focus:border-[#2563EB] focus:outline-none transition-colors text-[#0F172A] bg-[#F5F7FA]"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="mb-8">
            {timer > 0 ? (
              <p className="text-[#64748B]">
                Resend code in{" "}
                <span className="font-bold text-[#2563EB]">
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button className="text-[#2563EB] font-semibold hover:text-[#1D4ED8]">
                Resend Code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4">
            Verify Email
          </button>

          <Link href="/login" className="text-sm text-[#64748B] hover:text-[#0F172A]">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}