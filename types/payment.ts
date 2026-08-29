export interface CheckoutRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface CheckoutResponse {
  orderNumber: string;
  trackingToken: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  pricing: {
    subtotal: number;
    shipping: number;
    taxableAmount: number;
    tax: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
}
