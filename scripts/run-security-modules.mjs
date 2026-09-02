import { verifyPaymentSignature } from "../lib/razorpay/verify.ts";
import { rateLimit } from "../lib/security/rate-limit.ts";
import { withSecurityHeaders } from "../lib/security/headers.ts";

console.log("=================================================");
console.log("FARMSMITH PHASE 3 SECURITY MODULE VERIFICATION");
console.log("=================================================\n");

const testResults = [];

function recordResult(testName, passed, details = "") {
  testResults.push({ testName, passed, details });
  const badge = passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
  console.log(`${badge} ${testName} ${details ? "-> " + details : ""}`);
}

// 1. Signature verification module test
try {
  const isValid = verifyPaymentSignature({
    razorpayOrderId: "order_test_123",
    razorpayPaymentId: "pay_test_456",
    razorpaySignature: "invalid_fake_signature_hash_12345",
  });
  if (isValid === false) {
    recordResult("Razorpay HMAC signature rejection test", true, "Fake signature correctly rejected by crypto.createHmac");
  } else {
    recordResult("Razorpay HMAC signature rejection test", false, "Fake signature was improperly accepted");
  }
} catch (err) {
  recordResult("Razorpay HMAC signature rejection test", false, err.message);
}

// 2. Security Headers helper test
try {
  const headers = withSecurityHeaders();
  const nosniff = headers.get("X-Content-Type-Options");
  const frame = headers.get("X-Frame-Options");
  const hsts = headers.get("Strict-Transport-Security");

  if (nosniff === "nosniff" && frame === "DENY" && hsts) {
    recordResult("Security headers payload verification", true, "nosniff, DENY, HSTS present in response header map");
  } else {
    recordResult("Security headers payload verification", false, `nosniff: ${nosniff}, frame: ${frame}`);
  }
} catch (err) {
  recordResult("Security headers payload verification", false, err.message);
}

// 3. Rate limiter fallback test
async function testRateLimit() {
  try {
    const res1 = await rateLimit("test-key-phase3", 2, 60000);
    const res2 = await rateLimit("test-key-phase3", 2, 60000);
    const res3 = await rateLimit("test-key-phase3", 2, 60000);

    if (res1.success && res2.success && !res3.success) {
      recordResult("Distributed/Fallback rate limiter threshold test", true, "3rd request correctly blocked (429 condition triggered)");
    } else {
      recordResult("Distributed/Fallback rate limiter threshold test", false, `res1:${res1.success}, res2:${res2.success}, res3:${res3.success}`);
    }
  } catch (err) {
    recordResult("Distributed/Fallback rate limiter threshold test", false, err.message);
  }
}

testRateLimit().then(() => {
  console.log("\n=================================================");
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  console.log(`TOTAL MODULE TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log("=================================================");
  if (passed !== total) process.exit(1);
});
