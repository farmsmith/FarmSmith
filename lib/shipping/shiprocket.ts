import "server-only";

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
}

interface CreateShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string; // E.g. "Primary" or "FarmSmith Warehouse"
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number; // in KG (e.g., 0.5 for 500g)
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Authenticates with Shiprocket API and returns JWT token
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn("[Shiprocket] Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD in environment.");
    return null;
  }

  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      console.error("[Shiprocket] Auth failed:", await res.text());
      return null;
    }

    const data = await res.json();
    if (data.token) {
      cachedToken = {
        token: data.token,
        expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000, // Valid 10 days, cache for 9 days
      };
      return data.token;
    }
  } catch (err) {
    console.error("[Shiprocket] Auth error:", err);
  }

  return null;
}

/**
 * Pushes a new order to Shiprocket
 */
export async function createShiprocketOrder(payload: CreateShiprocketOrderPayload) {
  const token = await getShiprocketToken();
  if (!token) {
    console.warn("[Shiprocket] Skipping automatic order push due to unconfigured API credentials.");
    return null;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[Shiprocket] Order creation error:", data);
      return null;
    }

    return data; // Returns shipment_id, order_id, status, etc.
  } catch (err) {
    console.error("[Shiprocket] Order push failed:", err);
    return null;
  }
}
