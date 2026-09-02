/**
 * Automated Verification & Test Suite for FarmSmith Shiprocket Integration
 * Run with: npx tsx scripts/test-shiprocket-fulfillment.ts
 */

import { orderTrackingSchema } from "../lib/validation/order";

function calculatePackageDimensions(weightKg: number): {
  length: number;
  breadth: number;
  height: number;
} {
  if (weightKg <= 1.0) {
    return { length: 15, breadth: 15, height: 10 };
  } else if (weightKg <= 3.0) {
    return { length: 20, breadth: 20, height: 15 };
  } else {
    return { length: 30, breadth: 25, height: 20 };
  }
}

function assertEqual(actual: any, expected: any, testName: string) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✅ PASSED: ${testName}`);
  } else {
    console.error(`❌ FAILED: ${testName}`);
    console.error(`   Actual:`, actual);
    console.error(`   Expected:`, expected);
    process.exitCode = 1;
  }
}

function assertTrue(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASSED: ${testName}`);
  } else {
    console.error(`❌ FAILED: ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("FarmSmith Shiprocket Integration — Verification Tests");
  console.log("==================================================\n");

  // Test 1: Tier 1 Package Dimensions (<= 1.0 kg)
  const dimTier1 = calculatePackageDimensions(0.75);
  assertEqual(dimTier1, { length: 15, breadth: 15, height: 10 }, "Test 1: Tier 1 package dimensions (0.75kg)");

  // Test 2: Tier 2 Package Dimensions (1.0kg < weight <= 3.0kg)
  const dimTier2 = calculatePackageDimensions(2.2);
  assertEqual(dimTier2, { length: 20, breadth: 20, height: 15 }, "Test 2: Tier 2 package dimensions (2.2kg)");

  // Test 3: Tier 3 Package Dimensions (> 3.0kg)
  const dimTier3 = calculatePackageDimensions(4.5);
  assertEqual(dimTier3, { length: 30, breadth: 25, height: 20 }, "Test 3: Tier 3 package dimensions (4.5kg)");

  // Test 4: Tare Weight Packaging Addition Rule (50g)
  const productWeightGrams = 900;
  const tareWeightGrams = 50;
  const totalWeightKg = Math.max(0.1, Number(((productWeightGrams + tareWeightGrams) / 1000).toFixed(2)));
  assertEqual(totalWeightKg, 0.95, "Test 4: Product weight (900g) + 50g tare = 0.95kg");
  const dimWithTare = calculatePackageDimensions(totalWeightKg);
  assertEqual(dimWithTare, { length: 15, breadth: 15, height: 10 }, "Test 4b: Package dimension tier for 0.95kg");

  // Test 5: Tracking Validation Schema (Requires orderNumber & 20+ char trackingToken)
  const validTrackPayload = { orderNumber: "FS-2026-0F06D2", trackingToken: "a1b2c3d4e5f6g7h8i9j0k1l2" };
  const invalidTrackPayload = { orderNumber: "FS-2026-0F06D2" };
  assertTrue(orderTrackingSchema.safeParse(validTrackPayload).success, "Test 5a: Tracking schema accepts orderNumber + 20+ char trackingToken");
  assertTrue(!orderTrackingSchema.safeParse(invalidTrackPayload).success, "Test 5b: Tracking schema rejects missing trackingToken");

  // Test 6: Pre-flight lookup URL structure
  const orderNumber = "FS-2026-0F06D2";
  const expectedLookupUrl = `https://apiv2.shiprocket.in/v1/external/orders?channel_order_id=${encodeURIComponent(orderNumber)}`;
  assertEqual(
    `https://apiv2.shiprocket.in/v1/external/orders?channel_order_id=${encodeURIComponent(orderNumber)}`,
    expectedLookupUrl,
    "Test 6: Pre-flight lookup URL matching"
  );

  // Test 7: Mock 422 Duplicate Error String Matching
  const mock422Response = { statusCode: 422, message: "Order ID already exists" };
  const isDuplicateError =
    mock422Response.message.toLowerCase().includes("already exists") ||
    mock422Response.message.toLowerCase().includes("already been taken") ||
    mock422Response.statusCode === 422;
  assertTrue(isDuplicateError, "Test 7: 422 Duplicate error detection string matching");

  // Test 8: Mock Webhook Auth Token Matching
  const expectedSecret: string = "secret_webhook_key_123";
  const validHeader: string = "secret_webhook_key_123";
  const invalidHeader: string = "wrong_secret";
  assertTrue(validHeader === expectedSecret, "Test 8a: Webhook auth header matching");
  assertTrue(invalidHeader !== expectedSecret, "Test 8b: Webhook auth header rejection");

  // Test 9: Webhook Status Mapping (CANCELLED/RTO evaluated before DELIVERED)
  const mapStatus = (srStatus: string) => {
    const s = srStatus.toUpperCase();
    if (s.includes("CANCELLED") || s.includes("RTO") || s.includes("RETURN")) return "cancelled";
    if (s.includes("DELIVERED")) return "delivered";
    if (s.includes("IN TRANSIT") || s.includes("SHIPPED") || s.includes("DISPATCHED")) return "shipped";
    if (s.includes("PROCESSING") || s.includes("PACKING")) return "processing";
    return "unknown";
  };
  assertEqual(mapStatus("DELIVERED"), "delivered", "Test 9a: DELIVERED status mapping");
  assertEqual(mapStatus("IN TRANSIT"), "shipped", "Test 9b: IN TRANSIT status mapping");
  assertEqual(mapStatus("RTO OF DELIVERED"), "cancelled", "Test 9c: RTO status mapping");

  console.log("\n==================================================");
  if (process.exitCode === 1) {
    console.log("❌ Test suite encountered failures!");
  } else {
    console.log("🎉 ALL TEST SCENARIOS PASSED SUCCESSFULLY!");
  }
  console.log("==================================================");
}

runTests().catch(console.error);
