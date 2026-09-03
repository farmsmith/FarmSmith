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

/**
 * Calculates shipping fee based on state, district/city, pincode, and subtotal.
 * GLOBAL POLICY: Free delivery is completely eliminated.
 * Every customer pays the applicable shipping fee (minimum ₹60 standard fee).
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

  const DEFAULT_SHIPPING_FEE = 60;

  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("shipping_rates")
      .select("id, name, state, district, pincode_prefix, min_order_amount, shipping_amount, is_active")
      .eq("is_active", true);

    if (data && data.length > 0) {
      // Filter matching rates and strictly exclude any free delivery / zero shipping amount rules
      const matches = (data as ShippingRate[]).filter((rate) => {
        const rateAmount = Number(rate.shipping_amount);
        if (isNaN(rateAmount) || rateAmount <= 0) return false;
        if (rate.name && rate.name.toLowerCase().includes("free")) return false;

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
          // Specificity 1: Pincode prefix
          const aPrefix = a.pincode_prefix ? 1 : 0;
          const bPrefix = b.pincode_prefix ? 1 : 0;
          if (aPrefix !== bPrefix) return bPrefix - aPrefix;

          // Specificity 2: District match
          const aDist = a.district ? 1 : 0;
          const bDist = b.district ? 1 : 0;
          if (aDist !== bDist) return bDist - aDist;

          // Specificity 3: State match
          const aState = a.state ? 1 : 0;
          const bState = b.state ? 1 : 0;
          if (aState !== bState) return bState - aState;

          return Number(a.shipping_amount) - Number(b.shipping_amount);
        });

        const selected = matches[0];
        const calculatedAmount = Math.max(DEFAULT_SHIPPING_FEE, Number(selected.shipping_amount));

        return {
          amount: Number(calculatedAmount.toFixed(2)),
          rateId: selected.id,
          rateName: selected.name,
        };
      }
    }
  } catch (err) {
    console.warn("Using default shipping calculation fallback:", err);
  }

  // Mandatory fallback rule: Standard shipping fee applies to all locations
  return {
    amount: DEFAULT_SHIPPING_FEE,
    rateId: null,
    rateName: "Standard Shipping (₹60)",
  };
}
