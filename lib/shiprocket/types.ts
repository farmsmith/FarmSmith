export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number | string;
  discount?: number | string;
  tax?: number | string;
  hsn?: number | string;
}

export interface CreateShiprocketOrderPayload {
  order_id: string;
  order_date: string; // YYYY-MM-DD HH:mm
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_country?: string;
  shipping_state?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  shipping_charges?: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number; // in cm
  breadth: number; // in cm
  height: number; // in cm
  weight: number; // in kg (e.g. 0.5 for 500g)
}

export interface ShiprocketCreateOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now?: number;
  awb_code?: string;
  courier_company_id?: string;
  courier_name?: string;
  message?: string;
}

export interface ShiprocketSearchOrderItem {
  id: number;
  channel_order_id: string;
  shipments?: Array<{
    id: number;
    awb_code?: string | null;
    courier_name?: string | null;
    status?: string | null;
  }>;
  status: string;
  status_code: number;
}

export interface ShiprocketOrderSearchResponse {
  data: ShiprocketSearchOrderItem[];
}

export interface ShiprocketServiceabilityQuery {
  pickupPincode: string;
  deliveryPincode: string;
  weightInKg: number;
  isCOD?: boolean;
}

export interface ShiprocketCourierOption {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charges: number;
  total_charge: number;
  estimated_delivery_days: string;
  etd: string;
  rate: number;
}

export interface ShiprocketTrackingData {
  track_status: number;
  shipment_status: number;
  shipment_track: Array<{
    id: number;
    awb_code: string;
    courier_company_id: number;
    shipment_id: number;
    order_id: number;
    pickup_date: string;
    delivered_date: string;
    weight: string;
    packages: number;
    current_status: string;
    delivered_to: string;
    destination: string;
    consignee_name: string;
    origin: string;
    courier_name: string;
  }>;
  shipment_track_activities: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
    "sr-status": string;
  }>;
}
