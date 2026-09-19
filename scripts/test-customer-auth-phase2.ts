/**
 * Phase 2 unit checks for customer auth onboarding helpers (no DB writes).
 * Run: npx tsx scripts/test-customer-auth-phase2.ts
 */

import assert from "node:assert/strict";
import {
  computeAuthOnboardingComplete,
  customerHasName,
  customerHasRealEmail,
} from "../src/lib/auth/customer-onboarding";
import {
  isPlaceholderCustomerEmail,
  placeholderEmailForPhoneNorm,
  validateRegister,
} from "../src/lib/auth";

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

section("placeholder email");
assert.equal(isPlaceholderCustomerEmail("919876543210@phone-otp.indovyapar.local"), true);
assert.equal(isPlaceholderCustomerEmail("user@gmail.com"), false);
assert.equal(customerHasRealEmail("919876543210@phone-otp.indovyapar.local"), false);
assert.equal(customerHasRealEmail("user@gmail.com"), true);
assert.equal(
  placeholderEmailForPhoneNorm("919876543210"),
  "919876543210@phone-otp.indovyapar.local"
);

section("name");
assert.equal(customerHasName({ firstName: "A", lastName: null }), true);
assert.equal(customerHasName({ firstName: null, lastName: "B" }), true);
assert.equal(customerHasName({ firstName: "  ", lastName: null }), false);

section("authOnboardingComplete");
assert.equal(
  computeAuthOnboardingComplete({
    firstName: "A",
    lastName: null,
    email: "a@example.com",
    emailVerified: true,
    phone: "919876543210",
    phoneVerified: true,
  }),
  true
);

assert.equal(
  computeAuthOnboardingComplete({
    firstName: "A",
    lastName: null,
    email: "a@example.com",
    emailVerified: true,
    phone: "919876543210",
    phoneVerified: false,
  }),
  false,
  "phone must be verified"
);

assert.equal(
  computeAuthOnboardingComplete({
    firstName: null,
    lastName: null,
    email: "a@example.com",
    emailVerified: true,
    phone: "919876543210",
    phoneVerified: true,
  }),
  false,
  "name required"
);

assert.equal(
  computeAuthOnboardingComplete({
    firstName: "A",
    lastName: null,
    email: placeholderEmailForPhoneNorm("919876543210"),
    emailVerified: false,
    phone: "919876543210",
    phoneVerified: true,
  }),
  false,
  "placeholder email incomplete"
);

section("register validation");
const missingPhone = validateRegister({
  email: "a@example.com",
  password: "Password1",
  firstName: "Ada",
});
assert.equal(missingPhone.success, false);

const missingName = validateRegister({
  email: "a@example.com",
  password: "Password1",
  phone: "9876543210",
});
assert.equal(missingName.success, false);

const ok = validateRegister({
  email: "a@example.com",
  password: "Password1",
  name: "Ada Lovelace",
  phone: "9876543210",
});
assert.equal(ok.success, true);
if (ok.success) {
  assert.equal(ok.data.firstName, "Ada");
  assert.equal(ok.data.lastName, "Lovelace");
  assert.equal(ok.data.phone, "9876543210");
}

console.log("\nAll Phase 2 helper checks passed.");
