"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { IndovyaparLogo } from "./IndovyaparLogo";

// ─── Shared Design Tokens ─────────────────────────────────────────────────────
const C = {
  orange: "#FF6A00",
  orangeLight: "#FFF4EC",
  orangeDark: "#E55F00",
  green: "#1E5128",
  textDark: "#111827",
  textMid: "#374151",
  textGray: "#6B7280",
  border: "#D1D5DC",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  red: "#EF4444",
};

const font = "'Manrope', sans-serif";

// ─── Divider with text ────────────────────────────────────────────────────────
function OrDivider({ text = "OR" }: { text?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontFamily: font, fontSize: 12, color: C.textGray, fontWeight: 500 }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  rightEl,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  error?: string;
  rightEl?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontFamily: font,
          fontSize: 13,
          fontWeight: 600,
          color: C.textMid,
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 46,
          border: `1.5px solid ${error ? C.red : focused ? C.orange : C.border}`,
          borderRadius: 10,
          background: C.white,
          padding: "0 14px",
          gap: 10,
          transition: "border-color 0.15s",
          boxShadow: focused ? `0 0 0 3px ${error ? "#FEE2E2" : "#FFE8D6"}` : "none",
        }}
      >
        <Icon size={16} color={focused ? C.orange : C.textGray} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: font,
            fontSize: 14,
            color: C.textDark,
          }}
        />
        {rightEl}
      </div>
      {error && (
        <span style={{ fontFamily: font, fontSize: 12, color: C.red }}>{error}</span>
      )}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "email") {
      if (!email) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    } else {
      if (!phone) e.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit number";
    }
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); router.push("/"); }, 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Slim Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: 64,
        }}
      >
        <div style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
          <IndovyaparLogo fontSize={28} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: font, fontSize: 13, color: C.textGray }}>Home</span>
          <ChevronRight size={14} color={C.textGray} />
          <span style={{ fontFamily: font, fontSize: 13, color: C.orange, fontWeight: 600 }}>
            Sign In
          </span>
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 900,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          {/* ── Left Panel (decorative) ─────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              background: `linear-gradient(145deg, #FF6A00 0%, #FF5400 40%, #1E5128 100%)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 36px",
              gap: 28,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: -80,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                transform: "translateY(-50%)",
              }}
            />

            {/* Logo */}
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <IndovyaparLogo
                variant="light"
                style={{ fontSize: 44, lineHeight: "52px" }}
              />
              <p
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.8)",
                  marginTop: 6,
                  letterSpacing: "0.5px",
                }}
              >
                India's Marketplace
              </p>
            </div>

            {/* Banner image */}
            <div
              style={{
                width: "100%",
                height: 200,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1721808525150-b81e50c23669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                alt="Shopping"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(30,81,40,0.5), transparent)",
                }}
              />
            </div>

            {/* Perks */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                "10 Crore+ Products",
                "Trusted by 5 Crore+ Users",
                "Free & Fast Delivery",
              ].map((perk) => (
                <div
                  key={perk}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: "8px 14px",
                  }}
                >
                  <ShieldCheck size={15} color="rgba(255,255,255,0.9)" />
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: 500,
                    }}
                  >
                    {perk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Panel (form) ──────────────────────────────────────── */}
          <div
            style={{
              width: 420,
              flexShrink: 0,
              background: C.white,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 40px",
              gap: 20,
            }}
          >
            {/* Heading */}
            <div style={{ marginBottom: 4 }}>
              <h2
                style={{
                  fontFamily: font,
                  fontWeight: 800,
                  fontSize: 24,
                  color: C.textDark,
                  margin: 0,
                  lineHeight: "32px",
                }}
              >
                Welcome back 👋
              </h2>
              <p
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: C.textGray,
                  marginTop: 6,
                }}
              >
                Sign in to your Indovyapar account
              </p>
            </div>

            {/* Tab toggle: Email / Phone */}
            <div
              style={{
                display: "flex",
                background: C.bg,
                borderRadius: 10,
                padding: 4,
                border: `1px solid ${C.border}`,
              }}
            >
              {(["email", "phone"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setErrors({}); }}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: font,
                    fontSize: 13,
                    fontWeight: mode === tab ? 700 : 500,
                    color: mode === tab ? C.orange : C.textGray,
                    background: mode === tab ? C.white : "transparent",
                    boxShadow: mode === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {tab === "email" ? <Mail size={14} /> : <Phone size={14} />}
                  {tab === "email" ? "Email" : "Phone No."}
                </button>
              ))}
            </div>

            {/* Email / Phone input */}
            {mode === "email" ? (
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: C.textMid }}>
                  Phone Number
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 46,
                    border: `1.5px solid ${errors.phone ? C.red : C.border}`,
                    borderRadius: 10,
                    background: C.white,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0 12px",
                      height: "100%",
                      borderRight: `1px solid ${C.border}`,
                      background: C.bg,
                    }}
                  >
                    <span style={{ fontFamily: font, fontSize: 14, color: C.textMid, fontWeight: 600 }}>
                      🇮🇳 +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/, "")); setErrors((er) => ({ ...er, phone: "" })); }}
                    placeholder="98765 43210"
                    maxLength={10}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      padding: "0 14px",
                      fontFamily: font,
                      fontSize: 14,
                      color: C.textDark,
                      background: "transparent",
                    }}
                  />
                </div>
                {errors.phone && (
                  <span style={{ fontFamily: font, fontSize: 12, color: C.red }}>{errors.phone}</span>
                )}
              </div>
            )}

            {/* Password */}
            <InputField
              label="Password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showPass ? <EyeOff size={16} color={C.textGray} /> : <Eye size={16} color={C.textGray} />}
                </button>
              }
            />

            {/* Remember me + Forgot password */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontFamily: font,
                  fontSize: 13,
                  color: C.textMid,
                  userSelect: "none",
                }}
              >
                <div
                  onClick={() => setRemember((r) => !r)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: `2px solid ${remember ? C.orange : C.border}`,
                    background: remember ? C.orange : C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}
                >
                  {remember && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                Remember me
              </label>
              <button
                onClick={() => router.push("/forgot-password")}
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: C.orange,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                height: 48,
                background: loading ? "#FFAC70" : C.orange,
                border: "none",
                borderRadius: 12,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: font,
                fontWeight: 700,
                fontSize: 15,
                color: C.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.15s",
                boxShadow: "0 4px 14px rgba(255,106,0,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.orangeDark;
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.orange;
              }}
            >
              {loading ? (
                <span>Signing in…</span>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>

            <OrDivider text="OR CONTINUE WITH" />

            {/* Social login */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                {
                  label: "Google",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  style={{
                    flex: 1,
                    height: 44,
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: font,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textMid,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.orange;
                    (e.currentTarget as HTMLButtonElement).style.background = C.orangeLight;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                    (e.currentTarget as HTMLButtonElement).style.background = C.white;
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Register link */}
            <p
              style={{
                fontFamily: font,
                fontSize: 13,
                color: C.textGray,
                textAlign: "center",
                margin: 0,
              }}
            >
              New to Indovyapar?{" "}
              <button
                onClick={() => router.push("/register")}
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.orange,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ── Slim Footer ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: C.green,
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {["Privacy Policy", "Terms of Service", "Help Center"].map((link, i, arr) => (
          <span key={link} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a
              href="#"
              style={{
                fontFamily: font,
                fontSize: 12,
                color: "rgba(244,244,244,0.8)",
                textDecoration: "none",
              }}
            >
              {link}
            </a>
            {i < arr.length - 1 && (
              <span style={{ color: "rgba(244,244,244,0.3)", fontSize: 12 }}>|</span>
            )}
          </span>
        ))}
        <span style={{ fontFamily: font, fontSize: 12, color: "rgba(244,244,244,0.5)" }}>
          © 2026 <IndovyaparLogo variant="light" inline style={{ fontSize: 12, lineHeight: "1" }} />
        </span>
      </div>
    </div>
  );
}
