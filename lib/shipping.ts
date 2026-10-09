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

const ODISHA_SPECIAL_DISTRICTS = [
  "cuttack",
  "katak",
  "khorda",
  "khurda",
  "khordha",
  "bhubaneswar",
  "bbsr",
  "dhenkanal",
  "jagatsinghpur",
  "jagatsinghapur",
];

const PARADEEP_IDENTIFIERS = [
  "paradeep",
  "paradip",
  "paradip port",
  "paradeep port",
];

const PARADEEP_PINCODES = ["754142", "754228", "754141"];

/**
 * Pure fallback calculation implementing:
 * 1. Free shipping on orders above ₹645/-
 * 2. Free local delivery in Paradeep
 * 3. ₹59/- for Cuttack, Khorda, Dhenkanal, Jagatsinghpur districts
 * 4. ₹80/- for Rest of India
 */
export function getLocalShippingCalculation(
  state: string,
  pincode: string,
  subtotal: number,
  city?: string
): ShippingCalculation {
  const normalizedState = (state || "").trim().toLowerCase();
  const normalizedCity = (city || "").trim().toLowerCase();
  const normalizedPincode = (pincode || "").trim();

  // Tier 1: Free shipping on orders >= ₹645
  if (subtotal >= 645) {
    return {
      amount: 0,
      rateId: null,
      rateName: "Free Shipping (Orders above ₹645)",
    };
  }

  // Tier 2: Free local delivery in Paradeep
  const isParadeep =
    PARADEEP_IDENTIFIERS.some((p) => normalizedCity.includes(p)) ||
    PARADEEP_PINCODES.includes(normalizedPincode);

  if (isParadeep) {
    return {
      amount: 0,
      rateId: null,
      rateName: "Free Local Delivery (Paradeep)",
    };
  }

  // Tier 3: ₹59 for Cuttack, Khordha, Dhenkanal, Jagatsinghpur districts
  const isOdishaState =
    normalizedState.includes("odisha") ||
    normalizedState.includes("orissa");

  const districtMatch = ODISHA_SPECIAL_DISTRICTS.some((dist) =>
    normalizedCity.includes(dist)
  );

  const odishaSpecialPincode =
    isOdishaState &&
    (normalizedPincode.startsWith("751") || // Bhubaneswar / Khordha
      normalizedPincode.startsWith("752") || // Khordha / Puri rural border
      normalizedPincode.startsWith("753") || // Cuttack
      normalizedPincode.startsWith("754") || // Cuttack / Jagatsinghpur rural
      normalizedPincode.startsWith("759")); // Dhenkanal

  if (districtMatch || odishaSpecialPincode) {
    return {
      amount: 59,
      rateId: null,
      rateName: "Odisha District Delivery (₹59)",
    };
  }

  // Tier 4: ₹80 for Rest of India
  return {
    amount: 80,
    rateId: null,
    rateName: "Rest of India Standard Shipping (₹80)",
  };
}

/**
 * Calculates shipping fee based on state, district/city, pincode, and subtotal.
 * Authoritative business rules:
 * 1. Orders >= ₹645 -> FREE (₹0)
 * 2. Paradeep (city or pincode 754142) -> FREE Local Delivery (₹0)
 * 3. Cuttack, Khordha/Khurda/Bhubaneswar, Dhenkanal, Jagatsinghpur -> ₹59
 * 4. Rest of India -> ₹80
 */
export async function calculateShipping(
  state: string,
  pincode: string,
  subtotal: number,
  city?: string
): Promise<ShippingCalculation> {
  const normalizedState = (state || "").trim().toLowerCase();
  const normalizedCity = (city || "").trim().toLowerCase();
  const normalizedPincode = (pincode || "").trim();

  // Tier 1: Free shipping on orders >= ₹645
  if (subtotal >= 645) {
    return {
      amount: 0,
      rateId: null,
      rateName: "Free Shipping (Orders above ₹645)",
    };
  }

  // Tier 2: Free local delivery in Paradeep (by city/area name or pincode)
  const isParadeep =
    PARADEEP_IDENTIFIERS.some((p) => normalizedCity.includes(p)) ||
    PARADEEP_PINCODES.includes(normalizedPincode);

  if (isParadeep) {
    return {
      amount: 0,
      rateId: null,
      rateName: "Free Local Delivery (Paradeep)",
    };
  }

  // Tier 3: ₹59 for Cuttack, Khorda, Dhenkanal, Jagatsinghpur districts
  const isOdishaState =
    normalizedState.includes("odisha") ||
    normalizedState.includes("orissa");

  const districtMatch = ODISHA_SPECIAL_DISTRICTS.some((dist) =>
    normalizedCity.includes(dist)
  );

  const odishaSpecialPincode =
    isOdishaState &&
    (normalizedPincode.startsWith("751") || // Bhubaneswar / Khordha
      normalizedPincode.startsWith("752") || // Khordha / Puri rural border
      normalizedPincode.startsWith("753") || // Cuttack
      normalizedPincode.startsWith("754") || // Cuttack / Jagatsinghpur rural
      normalizedPincode.startsWith("759")); // Dhenkanal

  if (districtMatch || odishaSpecialPincode) {
    return {
      amount: 59,
      rateId: null,
      rateName: "Odisha District Delivery (₹59)",
    };
  }

  // Tier 4: Query DB for any custom active rates, otherwise standard ₹80 for Rest of India
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("shipping_rates")
      .select("id, name, state, district, pincode_prefix, min_order_amount, shipping_amount, is_active")
      .eq("is_active", true);

    if (data && data.length > 0) {
      // Exclude legacy/stale 60 rate
      const matches = (data as ShippingRate[]).filter((rate) => {
        const rateAmount = Number(rate.shipping_amount);
        if (isNaN(rateAmount) || rateAmount < 0) return false;
        if (rateAmount === 60) return false; // Ignore obsolete ₹60 standard rate

        const minOrder = Number(rate.min_order_amount || 0);
        if (subtotal < minOrder) return false;

        const rateState = rate.state?.trim().toLowerCase() ?? null;
        const rateDistrict = rate.district?.trim().toLowerCase() ?? null;
        const ratePrefix = rate.pincode_prefix?.trim() ?? null;

        const stateMatches = rateState === null || rateState === normalizedState || normalizedState.includes(rateState);
        const districtMatches = rateDistrict === null || (normalizedCity && normalizedCity.includes(rateDistrict));
        const prefixMatches = ratePrefix === null || normalizedPincode.startsWith(ratePrefix);

        return stateMatches && districtMatches && prefixMatches;
      });

      if (matches.length > 0) {
        matches.sort((a, b) => Number(a.shipping_amount) - Number(b.shipping_amount));
        const selected = matches[0];
        return {
          amount: Number(Number(selected.shipping_amount).toFixed(2)),
          rateId: selected.id,
          rateName: selected.name,
        };
      }
    }
  } catch (err) {
    console.warn("Using local shipping calculation fallback:", err);
  }

  // Tier 4 Default: ₹80 for Rest of India
  return {
    amount: 80,
    rateId: null,
    rateName: "Rest of India Standard Shipping (₹80)",
  };
}
