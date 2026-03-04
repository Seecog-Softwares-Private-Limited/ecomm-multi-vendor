"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type State = "loading" | "success" | "error";
type Result = { state: State; message?: string };

/**
 * Vendor email verification page at /vendor/verify?token=...
 * Calls GET /api/auth/verify-email?token=... and shows success or error.
 * If user is already logged in and verified, redirects to dashboard so they don't see "Go to login" after signing in.
 */
export function VendorVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<Result>({ state: "loading" });

  useEffect(() => {
    const token = searchParams.get("token");

    const run = async () => {
      if (token) {
        setResult({ state: "loading" });
        try {
          const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { credentials: "include" });
          const json = await res.json();
          if (res.ok && json?.success) {
            const meRes = await fetch("/api/vendor/me", { credentials: "include" });
            if (meRes.ok && (await meRes.json())?.data?.emailVerified) {
              router.replace("/vendor");
              return;
            }
            setResult({
              state: "success",
              message: json?.data?.message ?? "Email verified. Awaiting admin approval.",
            });
          } else {
            const meRes = await fetch("/api/vendor/me", { credentials: "include" });
            const meJson = await meRes.json();
            if (meRes.ok && meJson?.success && meJson?.data?.emailVerified) {
              router.replace("/vendor");
              return;
            }
            setResult({
              state: "error",
              message: json?.error?.message ?? "Invalid or expired verification link. Please request a new one or register again.",
            });
          }
        } catch {
          setResult({
            state: "error",
            message: "Something went wrong. Please try again or use the link from your email.",
          });
        }
        return;
      }

      setResult({ state: "loading" });
      try {
        const res = await fetch("/api/vendor/me", { credentials: "include" });
        const json = await res.json();
        if (res.ok && json?.success && json?.data?.emailVerified) {
          router.replace("/vendor");
          return;
        }
        setResult({
          state: "error",
          message: "Missing verification link. Please use the link from your email. If you already verified, go to login.",
        });
      } catch {
        setResult({
          state: "error",
          message: "Missing verification link. Please use the link from your email. If you already verified, go to login.",
        });
      }
    };

    run();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {result.state === "loading" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-600">Verifying your email…</p>
          </div>
        )}

        {result.state === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Email verified</h1>
            <p className="text-sm text-slate-600">{result.message}</p>
            <Link
              href="/vendor/login"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Go to login
            </Link>
          </div>
        )}

        {result.state === "error" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-rose-100 p-3">
              <XCircle className="h-10 w-10 text-rose-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Verification failed</h1>
            <p className="text-sm text-slate-600">{result.message}</p>
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/vendor/register"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Register again
              </Link>
              <Link
                href="/vendor/login"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Go to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
