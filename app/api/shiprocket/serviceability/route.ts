import { NextResponse } from "next/server";
import { checkShiprocketServiceability } from "@/lib/shiprocket/client";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = await rateLimit(`shiprocket-serviceability:${ip}`, 15, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429, headers }
    );
  }

  const body = await request.json().catch(() => null);
  const deliveryPincode = body?.deliveryPincode;
  const weightInKg = body?.weightInKg || 0.5; // Default 500g
  const isCOD = Boolean(body?.isCOD);

  if (!deliveryPincode || !/^\d{6}$/.test(String(deliveryPincode).trim())) {
    return NextResponse.json(
      { error: "Valid 6-digit Indian delivery pincode is required." },
      { status: 400, headers }
    );
  }

  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "751001"; // Default Bhubaneswar, Odisha hub

  try {
    const couriers = await checkShiprocketServiceability({
      pickupPincode,
      deliveryPincode: String(deliveryPincode).trim(),
      weightInKg,
      isCOD,
    });

    return NextResponse.json(
      {
        serviceable: couriers.length > 0,
        pickupPincode,
        deliveryPincode,
        availableCouriersCount: couriers.length,
        couriers,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Failed to query Shiprocket serviceability:", error);
    return NextResponse.json(
      { serviceable: false, error: "Serviceability lookup unavailable." },
      { status: 500, headers }
    );
  }
}
