"use client";

import * as React from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { Link } from "../../components/Link";
import {
  getOnboardingSteps,
  getOnboardingProgress,
  type OnboardingStepInput,
} from "@/lib/vendor-onboarding";

const PROFILE_KYC_PATH = "/vendor/profile";

export type OnboardingCardProps = OnboardingStepInput;

export function OnboardingCard({
  emailVerified,
  rawStatus,
}: OnboardingCardProps) {
  const steps = React.useMemo(
    () => getOnboardingSteps({ emailVerified, rawStatus }),
    [emailVerified, rawStatus]
  );
  const { current, total } = getOnboardingProgress(steps);

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/40">
        {/* Progress */}
        <p className="text-sm font-medium text-slate-500">
          Step {current} of {total}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>

        {/* Checklist */}
        <ul className="mt-8 space-y-5">
          {steps.map((step) => (
            <li
              key={step.id}
              className="flex items-center gap-4 text-[15px] text-slate-700"
            >
              {step.status === "done" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
              )}
              {step.status === "pending" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
                  <Circle className="h-4 w-4 text-slate-300" strokeWidth={2} />
                </span>
              )}
              {step.status === "in_progress" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-amber-600">
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                </span>
              )}
              <span
                className={
                  step.status === "done"
                    ? "font-medium text-slate-900"
                    : step.status === "in_progress"
                      ? "font-medium text-slate-800"
                      : "text-slate-600"
                }
              >
                {step.displayLabel ?? step.label}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8">
          <Link
            href={PROFILE_KYC_PATH}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Complete profile now
          </Link>
        </div>
      </div>
    </div>
  );
}
