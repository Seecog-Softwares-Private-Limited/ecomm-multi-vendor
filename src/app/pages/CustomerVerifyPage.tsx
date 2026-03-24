"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "../components/Link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { IndovyaparLogo } from "@/components/IndovyaparLogo";

type State = "loading" | "success" | "error" | "missing";

/**
 * Customer email confirmation after register — /verify-email?token=...
 */
export function CustomerVerifyPage() {
  const searchParams = useSearchParams();
  const [state, setState] = React.useState<State>("loading");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("missing");
      setMessage("Missing link. Open the confirmation link from your email.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && json?.success && json?.data?.accountType === "vendor") {
          setState("error");
          setMessage(
            "This link is for a vendor account. Please use the vendor verification email or contact support."
          );
          return;
        }
        if (res.ok && json?.success && json?.data?.verified && json?.data?.accountType === "customer") {
          setState("success");
          setMessage(json.data.message ?? "Email confirmed. You can sign in.");
          return;
        }
        setState("error");
        setMessage(json?.error?.message ?? "This link is invalid or has expired.");
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Something went wrong. Try again from your email link.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] p-8">
      <div className="mb-8 text-center">
        <Link href="/">
          <IndovyaparLogo fontSize={28} style={{ lineHeight: "32px" }} />
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Email confirmation
        </p>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-xl shadow-slate-200/30">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#FF6A00]" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Confirming your email…</h1>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-[#166534]" />
            <h1 className="mb-2 text-xl font-bold tracking-tight text-slate-900">You&apos;re all set</h1>
            <p className="mb-6 text-sm text-slate-600">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full rounded-xl bg-[#FF6A00] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00]"
            >
              Sign in
            </Link>
          </>
        )}
        {(state === "error" || state === "missing") && (
          <>
            <XCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h1 className="mb-2 text-xl font-bold tracking-tight text-slate-900">Couldn&apos;t confirm</h1>
            <p className="mb-6 text-sm text-slate-600">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="inline-block w-full rounded-xl bg-[#FF6A00] py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#E55F00]"
              >
                Register again
              </Link>
              <Link
                href="/login"
                className="text-center text-sm font-semibold text-[#FF6A00] hover:text-[#E55F00] transition"
              >
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
