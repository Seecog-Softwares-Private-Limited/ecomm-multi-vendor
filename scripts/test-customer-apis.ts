import assert from "node:assert/strict";
import { sanitizePlainText } from "../src/lib/text-sanitize.ts";

assert.equal(sanitizePlainText("  hello\x00world  ", 100), "helloworld");
assert.equal(sanitizePlainText("a".repeat(300), 10), "a".repeat(10));

console.log("customer-apis: ok");
