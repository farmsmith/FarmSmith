import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation/checkout";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { generateOrderNumber, generateTrackingToken } from "@/lib/utils/order-id";
import { calculateShipping } from "@/lib/shipping";
import { calculateItemTax, calculateTax } from "@/lib/tax";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { withSecurityHeaders } from "@/lib/security/headers";
import type { CheckoutResponse } from "@/types/payment";

function money(value: number): number {
  return Number(value.toFixed(2));
}

export async function POST(request: Request) {
  const headers = withSecurityHeaders();

  const ip = getClientIp(request);
  const rl = await rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const issueMessages = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    console.error("Checkout body validation failed:", issueMessages, "Received body:", body);
    return NextResponse.json(
      { error: `Invalid request: ${issueMessages}`, details: parsed.error.flatten() },
      { status: 400, headers }
    );
  }

  const { items, customer, shippingAddress } = parsed.data;
  const user = await getAuthenticatedUser(request);

  const uniqueProductIds = new Set(items.map((item) => item.productId));
  if (uniqueProductIds.size !== items.length) {
    return NextResponse.json(
      { error: "Duplicate products are not allowed in a checkout." },
      { status: 400, headers }
    );
  }

  const supabase = createAdminSupabaseClient();
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const validUuids = Array.from(new Set(items.map((item) => item.productId).filter((id) => uuidRegex.test(id))));
  const nonUuidIds = Array.from(new Set(items.map((item) => item.productId).filter((id) => !uuidRegex.test(id))));

  let products: any[] = [];

  if (validUuids.length > 0) {
    const { data: byId, error: errorById } = await supabase
      .from("products")
      .select("id, name, price, currency, gst_rate, is_active, stock_quantity, slug")
      .in("id", validUuids);

    if (errorById) {
      console.error("Failed to load products by ID", errorById);
    } else if (byId) {
      products.push(...byId);
    }
  }

  if (nonUuidIds.length > 0) {
    const { data: bySlug, error: errorBySlug } = await supabase
      .from("products")
      .select("id, name, price, currency, gst_rate, is_active, stock_quantity, slug")
      .in("slug", nonUuidIds);

    if (errorBySlug) {
      console.error("Failed to load products by slug", errorBySlug);
    } else if (bySlug) {
      bySlug.forEach((p) => {
        if (!products.some((existing) => existing.id === p.id)) {
          products.push(p);
        }
      });
    }
  }

  // Create a clean server-side mapped representation of cart items without mutating original request data
  const resolvedItems = items.map((item) => {
    const matchedProduct = products.find(
      (p) => p.id === item.productId || p.slug === item.productId
    );
    return {
      ...item,
      productId: matchedProduct ? matchedProduct.id : item.productId,
    };
  });

  if (!products || products.length === 0) {
    return NextResponse.json(
      { error: "One or more items in your cart are invalid or no longer available. Please refresh your cart." },
      { status: 400, headers }
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const currency = products[0]?.currency ?? "INR";

  for (const product of products) {
    if (product.currency !== currency) {
      return NextResponse.json(
        { error: "Products with different currencies cannot be purchased together." },
        { status: 400, headers }
      );
    }
  }

  for (const item of resolvedItems) {
    const product = productMap.get(item.productId);
    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: "One or more items in your cart are invalid or no longer available. Please refresh your cart." },
        { status: 400, headers }
      );
    }
    if (product.stock_quantity < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.name}` },
        { status: 409, headers }
      );
    }
  }

  const orderItems = resolvedItems.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    const subtotal = money(unitPrice * item.quantity);
    const gstRate = Number(product.gst_rate ?? 0);
    const taxAmount = calculateItemTax(subtotal, gstRate);

    return {
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal,
      gst_rate: gstRate,
      tax_amount: taxAmount,
    };
  });

  const subtotalAmount = money(
    orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  );

  let shipping;
  try {
    shipping = await calculateShipping(
      shippingAddress.state,
      shippingAddress.pincode,
      subtotalAmount,
      shippingAddress.city
    );
  } catch (error) {
    console.error("Shipping calculation failed", error);
    return NextResponse.json(
      { error: "Delivery is not currently available for this address." },
      { status: 400, headers }
    );
  }

  const tax = calculateTax(
    orderItems.map((item) => ({ subtotal: item.subtotal, gstRate: item.gst_rate })),
    shippingAddress.state
  );

  const totalAmount = money(subtotalAmount + shipping.amount + tax.taxAmount);

  const orderNumber = generateOrderNumber();
  const trackingToken = generateTrackingToken();

  const { data: orderId, error: createOrderError } = await supabase.rpc(
    "create_pending_order",
    {
      p_order: {
        order_number: orderNumber,
        tracking_token: trackingToken,
        customer_id: user?.id ?? null,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
        subtotal_amount: subtotalAmount,
        taxable_amount: tax.taxableAmount,
        shipping_amount: shipping.amount,
        tax_amount: tax.taxAmount,
        cgst_amount: tax.cgstAmount,
        sgst_amount: tax.sgstAmount,
        igst_amount: tax.igstAmount,
        total_amount: totalAmount,
        currency,
      },
      p_items: orderItems,
    }
  );

  if (createOrderError || !orderId) {
    const isStockConflict = createOrderError?.message?.includes("INSUFFICIENT_STOCK");
    return NextResponse.json(
      {
        error: isStockConflict
          ? "One or more items just went out of stock. Please refresh your cart."
          : "Failed to create order. Please try again.",
      },
      { status: isStockConflict ? 409 : 500, headers }
    );
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    await supabase.rpc("rollback_pending_order", { p_order_id: orderId });
    return NextResponse.json(
      { error: "Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing in environment variables" },
      { status: 500, headers }
    );
  }

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder(totalAmount, orderNumber, String(orderId));
  } catch (error: any) {
    const errorDetails =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      (typeof error === "object" ? JSON.stringify(error) : String(error));
    console.error("Failed to create Razorpay order:", { errorDetails, keyId: razorpayKeyId });
    await supabase.rpc("rollback_pending_order", { p_order_id: orderId });
    return NextResponse.json(
      { error: "Payment gateway initiation failed. Please try again later." },
      { status: 500, headers }
    );
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", orderId)
    .eq("status", "pending_payment");

  if (updateError) {
    const { data: rolledBack, error: rollbackError } = await supabase.rpc(
      "rollback_pending_order",
      { p_order_id: orderId }
    );

    if (rollbackError || rolledBack !== true) {
      console.error("CRITICAL: checkout rollback failed after order mapping failure", {
        orderId,
        rollbackError,
      });
    }

    return NextResponse.json(
      { error: "Failed to finalize payment setup. Please try again." },
      { status: 502, headers }
    );
  }

  const response: CheckoutResponse = {
    orderNumber,
    trackingToken,
    razorpayOrderId: razorpayOrder.id,
    razorpayKeyId,
    amount: Math.round(totalAmount * 100),
    currency,
    pricing: {
      subtotal: subtotalAmount,
      shipping: shipping.amount,
      taxableAmount: tax.taxableAmount,
      tax: tax.taxAmount,
      cgst: tax.cgstAmount,
      sgst: tax.sgstAmount,
      igst: tax.igstAmount,
      total: totalAmount,
    },
  };

  return NextResponse.json(response, { status: 201, headers });
}
