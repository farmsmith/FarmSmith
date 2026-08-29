import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface ShippingCalculation {
  amount: number;
  rateId: string | null;
  rateName: string;
}

type ShippingRate = {
  id: string;
  name: string;
  state: string | null;
  district: string | null;
  pincode_prefix: string | null;
  min_order_amount: number | string;
  shipping_amount: number | string;
  is_active: boolean;
};

// Pincode prefixes for the 3 Free Shipping Districts in Odisha:
// - Khordha / Bhubaneswar: 751, 752
// - Cuttack: 753, 7540, 7542
// - Jagatsinghpur: 7541, 7542
const ODISHA_FREE_PINCODE_PREFIXES = ["751", "752", "753", "754"];
const ODISHA_FREE_DISTRICT_NAMES = ["jagatsinghpur", "cuttack", "khordha", "khorda", "bhubaneswar"];

/**
 * Checks if address qualifies for Free Shipping based on Pincode or District Name
 */
export function isOdishaFreeDistrict(state: string, city: string = "", pincode: string = ""): boolean {
  const normState = state.trim().toLowerCase();
  const normCity = city.trim().toLowerCase();
  const normPincode = pincode.trim();

  // Must be in Odisha state or have Odisha pincode (starts with 75 or 76)
  const isOdisha = normState === "odisha" || normPincode.startsWith("75") || normPincode.startsWith("76");
  if (!isOdisha) return false;

  // 1. Check Pincode Prefix (751xx, 752xx, 753xx, 754xx)
  const matchesPincode = ODISHA_FREE_PINCODE_PREFIXES.some((prefix) => normPincode.startsWith(prefix));

  // 2. Check City / District Name
  const matchesCity = ODISHA_FREE_DISTRICT_NAMES.some((d) => normCity.includes(d));

  return matchesPincode || matchesCity;
}

/**
 * Calculates shipping fee based on state, district/city, pincode, and subtotal.
 */
export async function calculateShipping(
  state: string,
  pincode: string,
  subtotal: number,
  city?: string
): Promise<ShippingCalculation> {
  const normalizedState = state.trim().toLowerCase();
  const normalizedCity = (city || "").trim().toLowerCase();
  const normalizedPincode = pincode.trim();

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("shipping_rates")
      .select("id, name, state, district, pincode_prefix, min_order_amount, shipping_amount, is_active")
      .eq("is_active", true);

    if (data && data.length > 0) {
      const matches = (data as ShippingRate[]).filter((rate) => {
        const rateState = rate.state?.trim().toLowerCase() ?? null;
        const rateDistrict = rate.district?.trim().toLowerCase() ?? null;
        const ratePrefix = rate.pincode_prefix?.trim() ?? null;

        const stateMatches = rateState === null || rateState === normalizedState;
        const districtMatches = rateDistrict === null || (normalizedCity && normalizedCity.includes(rateDistrict));
        const prefixMatches = ratePrefix === null || normalizedPincode.startsWith(ratePrefix);
        const amountMatches = subtotal >= Number(rate.min_order_amount);

        return stateMatches && districtMatches && prefixMatches && amountMatches;
      });

      if (matches.length > 0) {
        matches.sort((a, b) => {
          const aPrefix = a.pincode_prefix ? 1 : 0;
          const bPrefix = b.pincode_prefix ? 1 : 0;
          if (aPrefix !== bPrefix) return bPrefix - aPrefix;

          const aDist = a.district ? 1 : 0;
          const bDist = b.district ? 1 : 0;
          if (aDist !== bDist) return bDist - aDist;

          return Number(a.shipping_amount) - Number(b.shipping_amount);
        });
        const selected = matches[0];
        return {
          amount: Number(Number(selected.shipping_amount).toFixed(2)),
          rateId: selected.id,
          rateName: selected.name,
        };
      }
    }
  } catch (err) {
    console.warn("Using fallback shipping calculation:", err);
  }

  // Fallback rule via dual Pincode + District check
  const isFree = isOdishaFreeDistrict(state, city, pincode);

  return {
    amount: isFree ? 0 : 60,
    rateId: null,
    rateName: isFree ? "Odisha Free District Shipping" : "Standard Shipping (₹60)",
  };
}
