import http from "node:http";
import { execSync } from "node:child_process";

// Comprehensive Phase 3 Security Verification Suite
console.log("=================================================");
console.log("FARMSMITH PHASE 3 SECURITY SUITE INITIALIZING...");
console.log("=================================================\n");

// Security tests runner targeting local API handlers or module logic
const testResults = [];

function recordResult(testName, passed, details = "") {
  testResults.push({ testName, passed, details });
  const badge = passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
  console.log(`${badge} ${testName} ${details ? "-> " + details : ""}`);
}

async function runAdversarialTests() {
  console.log("--- 1. AUTHENTICATION & IDOR BOUNDARY TESTS ---");
  
  // Test 1: Unauthenticated Order History
  try {
    const { POST } = await import("../app/api/account/orders/route.ts");
    // Simulate GET request without Authorization header
    const req = new Request("http://localhost:3000/api/account/orders", { method: "GET" });
    const { GET } = await import("../app/api/account/orders/route.ts");
    const res = await GET(req);
    const body = await res.json();
    if (res.status === 401 && body.error === "Authentication required") {
      recordResult("Unauthenticated /api/account/orders access blocked", true, "HTTP 401 returned");
    } else {
      recordResult("Unauthenticated /api/account/orders access blocked", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Unauthenticated /api/account/orders access blocked", false, err.message);
  }

  // Test 2: Unauthenticated Profile GET & PATCH
  try {
    const { GET, PATCH } = await import("../app/api/account/profile/route.ts");
    const reqGet = new Request("http://localhost:3000/api/account/profile", { method: "GET" });
    const resGet = await GET(reqGet);
    const bodyGet = await resGet.json();
    
    const reqPatch = new Request("http://localhost:3000/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Attacker", phone: "9999999999" }),
    });
    const resPatch = await PATCH(reqPatch);
    const bodyPatch = await resPatch.json();

    if (resGet.status === 401 && resPatch.status === 401) {
      recordResult("Unauthenticated /api/account/profile access blocked", true, "GET and PATCH returned HTTP 401");
    } else {
      recordResult("Unauthenticated /api/account/profile access blocked", false, `GET ${resGet.status}, PATCH ${resPatch.status}`);
    }
  } catch (err) {
    recordResult("Unauthenticated /api/account/profile access blocked", false, err.message);
  }

  console.log("\n--- 2. INPUT VALIDATION & BUSINESS LOGIC ATTACKS ---");

  // Test 3: Negative Quantity Checkout Attack
  try {
    const { POST } = await import("../app/api/checkout/route.ts");
    const req = new Request("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: "00000000-0000-0000-0000-000000000001", quantity: -5 }],
        shippingAddress: {
          line1: "123 Test St",
          city: "Bhubaneswar",
          state: "Odisha",
          pincode: "751001",
        },
        customerName: "Attacker",
        customerEmail: "attacker@example.com",
        customerPhone: "9876543210",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    if (res.status === 400 && body.error === "Invalid request payload") {
      recordResult("Negative quantity checkout attack rejected", true, "HTTP 400 returned by Zod validator");
    } else {
      recordResult("Negative quantity checkout attack rejected", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Negative quantity checkout attack rejected", false, err.message);
  }

  // Test 4: Zero Quantity Quote Attack
  try {
    const { POST } = await import("../app/api/checkout/quote/route.ts");
    const req = new Request("http://localhost:3000/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: "00000000-0000-0000-0000-000000000001", quantity: 0 }],
        shippingAddress: {
          line1: "123 Test St",
          city: "Bhubaneswar",
          state: "Odisha",
          pincode: "751001",
        },
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    if (res.status === 400 && body.error === "Invalid request") {
      recordResult("Zero quantity quote attack rejected", true, "HTTP 400 returned");
    } else {
      recordResult("Zero quantity quote attack rejected", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Zero quantity quote attack rejected", false, err.message);
  }

  // Test 5: Sequential Order Tracking without Token Attack
  try {
    const { POST } = await import("../app/api/orders/track/route.ts");
    const req = new Request("http://localhost:3000/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: "FS-10001" }), // Missing trackingToken
    });
    const res = await POST(req);
    const body = await res.json();
    if (res.status === 400 && body.error === "Invalid tracking request") {
      recordResult("Sequential order_number tracking without token rejected", true, "HTTP 400 returned");
    } else {
      recordResult("Sequential order_number tracking without token rejected", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Sequential order_number tracking without token rejected", false, err.message);
  }

  console.log("\n--- 3. PAYMENT & WEBHOOK SECURITY TESTS ---");

  // Test 6: Fake Razorpay Signature Verification Attack
  try {
    const { POST } = await import("../app/api/verify-payment/route.ts");
    const req = new Request("http://localhost:3000/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: "order_fake_12345",
        razorpay_payment_id: "pay_fake_67890",
        razorpay_signature: "deadbeefbad1234567890abcdef",
        order_number: "FS-10001",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    if (res.status === 400 && body.error === "Invalid payment signature.") {
      recordResult("Fake Razorpay payment verification rejected", true, "HMAC signature check failed (HTTP 400)");
    } else {
      recordResult("Fake Razorpay payment verification rejected", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Fake Razorpay payment verification rejected", false, err.message);
  }

  // Test 7: Fake Razorpay Webhook Signature Attack
  try {
    const { POST } = await import("../app/api/razorpay/webhook/route.ts");
    const req = new Request("http://localhost:3000/api/razorpay/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "invalid_forged_webhook_signature",
      },
      body: JSON.stringify({ event: "payment.captured", payload: {} }),
    });
    const res = await POST(req);
    const body = await res.json();
    if (res.status === 400 && body.error === "Invalid webhook signature") {
      recordResult("Fake Razorpay webhook signature rejected", true, "HTTP 400 returned");
    } else {
      recordResult("Fake Razorpay webhook signature rejected", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Fake Razorpay webhook signature rejected", false, err.message);
  }

  // Test 8: Shiprocket Webhook Unauthorized Access Test
  try {
    process.env.SHIPROCKET_WEBHOOK_SECRET = "secret_token_123";
    const { POST } = await import("../app/api/shiprocket/webhook/route.ts");
    const req = new Request("http://localhost:3000/api/shiprocket/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shiprocket-token": "wrong_token",
      },
      body: JSON.stringify({ order_id: "FS-10001", current_status: "DELIVERED" }),
    });
    const res = await POST(req);
    const body = await res.json();
    if (res.status === 401 && body.error === "Unauthorized webhook request") {
      recordResult("Unauthorized Shiprocket webhook request rejected", true, "HTTP 401 returned");
    } else {
      recordResult("Unauthorized Shiprocket webhook request rejected", false, `HTTP ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    recordResult("Unauthorized Shiprocket webhook request rejected", false, err.message);
  }

  console.log("\n--- 4. RATE LIMITING & SECURITY HEADERS TESTS ---");

  // Test 9: Security Headers Verification
  try {
    const { GET } = await import("../app/api/products/route.ts");
    const req = new Request("http://localhost:3000/api/products", { method: "GET" });
    const res = await GET(req);
    
    const xContentType = res.headers.get("x-content-type-options");
    const xFrameOptions = res.headers.get("x-frame-options");
    const hsts = res.headers.get("strict-transport-security");

    if (xContentType === "nosniff" && xFrameOptions === "DENY" && hsts) {
      recordResult("Security headers enforced on API responses", true, "nosniff, DENY, HSTS active");
    } else {
      recordResult("Security headers enforced on API responses", false, `nosniff: ${xContentType}, frame: ${xFrameOptions}`);
    }
  } catch (err) {
    recordResult("Security headers enforced on API responses", false, err.message);
  }

  console.log("\n=================================================");
  console.log("SECURITY VERIFICATION SUMMARY:");
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log("=================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runAdversarialTests();
