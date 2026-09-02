import "server-only";

import type {
  CreateShiprocketOrderPayload,
  ShiprocketCreateOrderResponse,
  ShiprocketServiceabilityQuery,
  ShiprocketCourierOption,
  ShiprocketTrackingData,
  ShiprocketSearchOrderItem,
  ShiprocketOrderSearchResponse,
} from "./types";

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Authenticates with Shiprocket API to obtain a JWT Bearer Token.
 * Caches token in server memory for 9 days (Shiprocket tokens expire in 10 days).
 */
export async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD in environment variables."
    );
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Shiprocket authentication failed:", errText);
    throw new Error(`Shiprocket auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error("Shiprocket authentication did not return a token.");
  }

  const token = String(data.token);
  cachedToken = token;
  // Expire cache 1 day before actual token expiration
  tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;
  return token;
}

/**
 * Pushes a new order to Shiprocket for warehouse packing & courier fulfillment.
 */
export async function createShiprocketOrder(
  payload: CreateShiprocketOrderPayload
): Promise<ShiprocketCreateOrderResponse> {
  const token = await getShiprocketToken();

  const response = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });

  const data = await response.json();

  if (!response.ok || data.status_code === 0) {
    let errorDetail = "";
    if (data?.errors) {
      errorDetail = typeof data.errors === "string" ? data.errors : JSON.stringify(data.errors);
    } else if (data?.message) {
      errorDetail = typeof data.message === "string" ? data.message : JSON.stringify(data.message);
    } else {
      errorDetail = `Shiprocket Order Creation Failed with status ${response.status}`;
    }
    const errObj = new Error(errorDetail);
    (errObj as any).statusCode = response.status;
    (errObj as any).responseData = data;
    throw errObj;
  }

  return data as ShiprocketCreateOrderResponse;
}

/**
 * Searches Shiprocket for an existing order by channel_order_id (e.g., "FS-2026-0F06D2").
 * Used for pre-flight reconciliation and recovery after crash or duplicate error response.
 */
export async function getShiprocketOrderByChannelId(
  channelOrderId: string
): Promise<ShiprocketSearchOrderItem | null> {
  const token = await getShiprocketToken();

  const response = await fetch(
    `${SHIPROCKET_BASE_URL}/orders?channel_order_id=${encodeURIComponent(channelOrderId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    console.error("Shiprocket order lookup failed:", response.statusText);
    return null;
  }

  const data: ShiprocketOrderSearchResponse = await response.json();
  if (Array.isArray(data?.data) && data.data.length > 0) {
    const match = data.data.find(
      (item) => String(item.channel_order_id) === String(channelOrderId)
    );
    return match || null;
  }

  return null;
}

/**
 * Checks courier serviceability, freight rates, and estimated delivery dates for a pincode.
 */
export async function checkShiprocketServiceability(
  query: ShiprocketServiceabilityQuery
): Promise<ShiprocketCourierOption[]> {
  const token = await getShiprocketToken();

  const params = new URLSearchParams({
    pickup_postcode: query.pickupPincode,
    delivery_postcode: query.deliveryPincode,
    weight: query.weightInKg.toString(),
    cod: query.isCOD ? "1" : "0",
  });

  const response = await fetch(
    `${SHIPROCKET_BASE_URL}/courier/serviceability?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    console.error("Shiprocket serviceability query failed:", await response.text());
    return [];
  }

  const data = await response.json();
  const availableCouriers = data?.data?.available_courier_companies || [];

  return availableCouriers.map((item: any) => ({
    courier_company_id: item.courier_company_id,
    courier_name: item.courier_name,
    freight_charge: item.freight_charge,
    cod_charges: item.cod_charges,
    total_charge: item.rate,
    estimated_delivery_days: item.etd,
    etd: item.etd,
    rate: item.rate,
  }));
}

/**
 * Retrieves live tracking activities and current shipment status from Shiprocket.
 */
export async function getShiprocketOrderTracking(
  shipmentIdOrAWB: string
): Promise<ShiprocketTrackingData | null> {
  const token = await getShiprocketToken();

  const response = await fetch(
    `${SHIPROCKET_BASE_URL}/courier/track/awb/${shipmentIdOrAWB}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data as ShiprocketTrackingData;
}
