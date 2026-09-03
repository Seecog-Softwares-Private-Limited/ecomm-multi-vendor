/**
 * Smoke test: checkout preview coupon validity messages (no DB).
 * Run: npx tsx scripts/test-coupon-preview-messages.ts
 *
 * Mirrors message mapping in checkout-session.service.ts catch block.
 */
function messageForError(msg: string): string {
  return msg === "COUPON_EXhausted"
    ? "This coupon has reached its usage limit."
    : "Invalid or expired coupon code";
}

function assert(cond: boolean, m: string) {
  if (!cond) throw new Error(m);
}

assert(messageForError("COUPON_INVALID") === "Invalid or expired coupon code", "invalid");
assert(messageForError("COUPON_EXhausted") === "This coupon has reached its usage limit.", "exhausted");
assert(messageForError("OTHER") === "Invalid or expired coupon code", "other");

console.log("OK: coupon preview error message mapping");
