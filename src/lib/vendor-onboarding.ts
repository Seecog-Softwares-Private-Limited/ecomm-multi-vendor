/**
 * Centralized vendor onboarding status and steps.
 * Use isVendorApproved() and getOnboardingSteps() across layout, sidebar, and dashboard.
 */

import type { VendorStatusDisplay } from "@/lib/auth";

/** Approved status unlocks full sidebar and normal dashboard. */
export function isVendorApproved(status: VendorStatusDisplay | string | null | undefined): boolean {
  return status === "approved";
}

/** Raw DB status (e.g. DRAFT, SUBMITTED, APPROVED). */
export type VendorRawStatus = string | null | undefined;

/** Single onboarding step for checklist UI. */
export type OnboardingStep = {
  id: string;
  label: string;
  status: "done" | "pending" | "in_progress";
  /** Optional display label (e.g. "Awaiting Admin Approval" when in_progress). */
  displayLabel?: string;
};

export type OnboardingStepInput = {
  emailVerified: boolean;
  rawStatus: VendorRawStatus;
};

/** Returns 3-step checklist: Email Verified, Profile & KYC, Admin Approval. */
export function getOnboardingSteps(input: OnboardingStepInput): OnboardingStep[] {
  const { emailVerified, rawStatus } = input;
  const approved = rawStatus === "APPROVED";
  // Only SUBMITTED = vendor actually clicked "Submit for Approval". UNDER_REVIEW/DRAFT = not submitted (e.g. set by email verify or legacy).
  const kycSubmitted = rawStatus === "SUBMITTED";
  const profileAndKycDone = approved || kycSubmitted;

  return [
    {
      id: "email",
      label: "Email verified",
      status: emailVerified ? "done" : "pending",
    },
    {
      id: "kyc",
      label: "Complete Profile & KYC",
      status: profileAndKycDone ? "done" : "pending",
      displayLabel: kycSubmitted ? "KYC Submitted" : undefined,
    },
    {
      id: "approval",
      label: "Admin approval",
      status: approved ? "done" : kycSubmitted ? "in_progress" : "pending",
      displayLabel: kycSubmitted && !approved ? "Awaiting Admin Approval" : undefined,
    },
  ];
}

/** Progress: current step index (1-based) and total steps. */
export function getOnboardingProgress(steps: OnboardingStep[]): { current: number; total: number } {
  const total = steps.length;
  const current = steps.findIndex((s) => s.status !== "done") + 1;
  return { current: current === 0 ? total : current, total };
}
