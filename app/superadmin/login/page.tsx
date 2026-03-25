"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { superadminApi, setToken, setUser } from "@/lib/superadmin-api";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password) {
      const msg = "Email and password are required.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const res = await superadminApi.auth.login(email.trim(), password);
      if (!res.success || !res.data) {
        const msg = (res as { message?: string }).message || "Login failed.";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      setToken(res.data.token);
      setUser(res.data.admin as object);
      toast.success("Welcome back.");
      router.replace("/superadmin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      const isNetwork = /fetch|network|failed|refused/i.test(message);
      const msg = isNetwork
        ? "Cannot reach the server. Check that the app is running and try again."
        : message;
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        fontFamily: "'Manrope', sans-serif",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(34,197,94,0.18), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(255,106,0,0.18), transparent 55%), linear-gradient(135deg, #0B1220 0%, #111827 45%, #0B1220 100%)",
      }}
    >
      <div className="w-full max-w-[980px] grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/95">
        {/* Left brand panel */}
        <div
          className="hidden md:flex flex-col justify-between p-10 text-white"
          style={{
            background:
              "linear-gradient(135deg, #166534 0%, #0B1220 45%, #FF6A00 120%)",
          }}
        >
          <div>
            <IndovyaparLogo variant="light" fontSize={26} style={{ lineHeight: "32px" }} />
            <p className="mt-2 text-white/80 text-sm">
              Super Admin Control Center
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: ShieldCheck, title: "Full access", desc: "Manage admins, roles & permissions." },
                { icon: Lock, title: "Secure auth", desc: "JWT-based protected routes." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 items-start">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-white/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">
            Default: superadmin@example.com / SuperAdmin@123
          </p>
        </div>

        {/* Right form panel */}
        <div className="p-8 sm:p-10">
          <div className="md:hidden mb-6">
            <IndovyaparLogo fontSize={22} style={{ lineHeight: "28px" }} />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign in
            </h1>
            <p className="text-slate-600 mt-1">
              Use your Super Admin credentials to continue.
            </p>
          </div>

          <form
            method="post"
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-white outline-none"
                  placeholder="superadmin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {formError && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-white outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold transition disabled:opacity-60 shadow-sm hover:shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #FF6A00 0%, #E55F00 50%, #16A34A 140%)",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 md:hidden text-center text-xs text-slate-500">
            Default: superadmin@example.com / SuperAdmin@123
          </div>
        </div>
      </div>
    </div>
  );
}
