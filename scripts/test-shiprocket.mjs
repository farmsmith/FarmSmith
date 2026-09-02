import fs from "fs";

function loadEnv() {
  try {
    const content = fs.readFileSync(".env.local", "utf8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...val] = trimmed.split("=");
        process.env[key.trim()] = val.join("=").trim();
      }
    });
  } catch (err) {
    console.error("Could not load .env.local", err);
  }
}

loadEnv();

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "625010";

console.log("---------------------------------------------------");
console.log("🧪 TESTING SHIPROCKET INTEGRATION...");
console.log("Email:", email);
console.log("Pickup Pincode:", pickupPincode);
console.log("---------------------------------------------------");

async function testShiprocket() {
  if (!email || !password) {
    console.error("❌ ERROR: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD missing in .env.local");
    return;
  }

  // 1. Authenticate
  console.log("\n1️⃣ Authenticating with Shiprocket API...");
  const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authRes.json();
  if (!authRes.ok || !authData.token) {
    console.error("❌ Authentication Failed:", authData);
    return;
  }

  console.log("✅ AUTHENTICATION SUCCESSFUL!");
  console.log("Bearer Token Received:", authData.token.substring(0, 25) + "...");

  // 2. Test Courier Serviceability Check (e.g. shipping to Chennai pincode 600001)
  const deliveryPincode = "600001";
  console.log(`\n2️⃣ Checking Courier Serviceability & Rates from ${pickupPincode} to ${deliveryPincode}...`);

  const params = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight: "0.5",
    cod: "0",
  });

  const serviceRes = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/serviceability?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authData.token}`,
      },
    }
  );

  const serviceData = await serviceRes.json();
  if (!serviceRes.ok) {
    console.error("❌ Serviceability Check Error:", serviceData);
    return;
  }

  const couriers = serviceData?.data?.available_courier_companies || [];
  console.log(`\n✅ SERVICEABILITY CHECK SUCCESSFUL! Found ${couriers.length} available courier services:`);
  
  couriers.slice(0, 5).forEach((courier, idx) => {
    console.log(
      `   [${idx + 1}] ${courier.courier_name} | Rate: ₹${courier.rate} | Est. Delivery: ${courier.etd} days`
    );
  });

  console.log("\n🎉 SHIPROCKET API INTEGRATION IS FULLY FUNCTIONAL AND WORKING PERFECTLY!");
}

testShiprocket();
