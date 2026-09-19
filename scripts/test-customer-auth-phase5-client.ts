/**
 * Phase 5 — Customer Web onboarding client helpers (no DB / no backend changes).
 *
 * Run: npx tsx scripts/test-customer-auth-phase5-client.ts
 */

import assert from "node:assert/strict";
import {
  customerNeedsAuthOnboarding,
  resolveCustomerOnboardingStep,
  isAccountIncompleteApiError,
  redirectIfAccountIncomplete,
  isPlaceholderCustomerEmailClient,
  CUSTOMER_ONBOARDING_PATH,
} from "../src/lib/auth/customer-onboarding-client";

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

function main() {
  section("existing complete user — no onboarding");
  assert.equal(
    customerNeedsAuthOnboarding({
      authOnboardingComplete: true,
      needsAuthOnboarding: false,
      phoneVerified: true,
      emailVerified: true,
    }),
    false
  );
  assert.equal(
    resolveCustomerOnboardingStep({
      authOnboardingComplete: true,
      needsAuthOnboarding: false,
      phoneVerified: true,
      emailVerified: true,
      email: "a@b.com",
      firstName: "A",
      phone: "919876543210",
    }),
    "done"
  );

  section("phone-first incomplete — name + email");
  assert.equal(
    customerNeedsAuthOnboarding({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: true,
      phone: "919876543210",
      email: "x@phone-otp.indovyapar.local",
    }),
    true
  );
  assert.equal(
    resolveCustomerOnboardingStep({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: true,
      phone: "919876543210",
      email: "x@phone-otp.indovyapar.local",
    }),
    "name_email"
  );
  assert.equal(isPlaceholderCustomerEmailClient("x@phone-otp.indovyapar.local"), true);

  section("phone-first — await email verification");
  assert.equal(
    resolveCustomerOnboardingStep({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: true,
      phone: "919876543210",
      email: "real@example.com",
      firstName: "Sumit",
      emailVerified: false,
    }),
    "await_email_verification"
  );

  section("google-first incomplete — phone otp");
  assert.equal(
    resolveCustomerOnboardingStep({
      authOnboardingComplete: false,
      needsAuthOnboarding: true,
      phoneVerified: false,
      email: "g@example.com",
      firstName: "G",
      emailVerified: true,
      oauthProvider: "google",
    }),
    "phone_otp"
  );

  section("ACCOUNT_INCOMPLETE only — not other 403s");
  assert.equal(
    isAccountIncompleteApiError({
      success: false,
      error: { code: "ACCOUNT_INCOMPLETE", message: "Complete setup", details: { needsAuthOnboarding: true } },
    }),
    true
  );
  assert.equal(
    isAccountIncompleteApiError({
      success: false,
      error: { code: "FORBIDDEN", message: "Nope" },
    }),
    false
  );
  assert.equal(
    isAccountIncompleteApiError({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Login" },
    }),
    false
  );

  section("redirectIfAccountIncomplete");
  let navigated: string | null = null;
  assert.equal(
    redirectIfAccountIncomplete(
      { error: { code: "ACCOUNT_INCOMPLETE" } },
      (p) => {
        navigated = p;
      }
    ),
    true
  );
  assert.equal(navigated, CUSTOMER_ONBOARDING_PATH);
  navigated = null;
  assert.equal(
    redirectIfAccountIncomplete({ error: { code: "FORBIDDEN" } }, (p) => {
      navigated = p;
    }),
    false
  );
  assert.equal(navigated, null);

  section("no password asked — steps never include password");
  const steps = ["phone_otp", "name_email", "await_email_verification", "done"] as const;
  for (const s of steps) {
    assert.ok(!String(s).includes("password"));
  }

  console.log("\nPhase 5 client tests passed.\n");
}

main();
