import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils/cn";
import { escapeHtml, sanitizeHeaderValue } from "@/lib/security/html";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

// Module-level in-memory cache to prevent duplicate email dispatches within process lifecycle
const dispatchedOrderEmails = new Set<string>();
const dispatchedAdminEmails = new Set<string>();

/**
 * Sends a notification email to the store owner/admin when a new order is received.
 * Safe to be called asynchronously in background tasks.
 * Idempotent: checks if admin notification was already dispatched for this order.
 */
export async function sendAdminOrderNotificationEmail(orderId: string): Promise<SendEmailResult> {
  console.log(`[AdminEmail] Invoked sendAdminOrderNotificationEmail for orderId: ${orderId}`);

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn(`[AdminEmail] RESEND_API_KEY not configured. Skipping admin notification for order ${orderId}`);
    return { success: false, skipped: true, error: "RESEND_API_KEY missing" };
  }

  if (dispatchedAdminEmails.has(orderId)) {
    console.log(`[AdminEmail] Admin notification already dispatched for order ${orderId}. Skipping duplicate.`);
    return { success: true, skipped: true };
  }

  try {
    const supabase = createAdminSupabaseClient();

    // Fetch complete order & items data
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_name,
          unit_price,
          quantity,
          subtotal,
          tax_amount
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error(`[AdminEmail] Failed to load order ${orderId} for admin notification:`, orderErr?.message);
      return { success: false, error: orderErr?.message || "Order not found" };
    }

    const adminEmailRaw = process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || "farmsmith6@gmail.com";
    const recipientAdminEmail = adminEmailRaw.includes("<")
      ? adminEmailRaw.match(/<([^>]+)>/)?.[1] || adminEmailRaw
      : adminEmailRaw;

    const senderEmail = "FarmSmith Orders <onboarding@resend.dev>";
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://farm-smith.vercel.app";
    const directTrackingUrl = `${siteUrl}/order/${encodeURIComponent(order.order_number)}?token=${encodeURIComponent(order.tracking_token || "")}`;

    // Escape dynamic strings
    const safeOrderNumber = escapeHtml(order.order_number);
    const safeCustomerName = escapeHtml(order.customer_name || "Guest Customer");
    const safeCustomerEmail = escapeHtml(order.customer_email || "N/A");
    const safeCustomerPhone = escapeHtml(order.customer_phone || "N/A");
    const safeRazorpayPaymentId = escapeHtml(order.razorpay_payment_id || "N/A");
    const safeRazorpayOrderId = escapeHtml(order.razorpay_order_id || "N/A");
    const safeShiprocketShipmentId = escapeHtml(order.shiprocket_shipment_id || "Pending / Auto-dispatch");

    // Build items HTML table rows
    const itemsHtml = (order.order_items || [])
      .map(
        (item: { product_name: string; quantity: number; unit_price: number; subtotal?: number }) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #1F2937;">
            <strong>${escapeHtml(item.product_name)}</strong>
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #4B5563; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #1F2937; text-align: right; font-weight: 600;">
            ${formatPrice(item.subtotal || item.unit_price * item.quantity)}
          </td>
        </tr>
      `
      )
      .join("");

    const shippingAddr = (order.shipping_address as Record<string, string>) || {};
    const addressCityStatePin = [
      shippingAddr.city ? escapeHtml(shippingAddr.city) : "",
      shippingAddr.state ? escapeHtml(shippingAddr.state) : "",
      shippingAddr.pincode ? escapeHtml(shippingAddr.pincode) : "",
    ]
      .filter(Boolean)
      .join(", ");

    const formattedAddress = [
      shippingAddr.line1 ? escapeHtml(shippingAddr.line1) : null,
      shippingAddr.line2 ? escapeHtml(shippingAddr.line2) : null,
      addressCityStatePin || null,
      "India",
    ]
      .filter(Boolean)
      .join("<br/>");

    const orderTime = new Date(order.created_at || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const adminHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🚨 New Order Received - ${safeOrderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #E5E7EB;">
              
              <!-- Header Alert Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #1C3121 0%, #2D4C34 100%); padding: 28px 24px; text-align: center;">
                  <span style="background: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px;">
                    ⚡ Store Admin Alert
                  </span>
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">New Order Placed! 🎉</h1>
                  <p style="margin: 6px 0 0; color: #D1D5DB; font-size: 14px;">Order #${safeOrderNumber} • Total: <strong style="color: #6EE7B7;">${formatPrice(order.total_amount)}</strong></p>
                </td>
              </tr>

              <!-- Key Metrics Grid -->
              <tr>
                <td style="padding: 24px 24px 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50%" style="padding: 12px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                        <span style="font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Order Amount</span>
                        <div style="font-size: 20px; font-weight: 800; color: #15803D; margin-top: 4px;">${formatPrice(order.total_amount)}</div>
                        <span style="font-size: 11px; color: #059669; font-weight: 600;">✓ Payment Paid</span>
                      </td>
                      <td width="8"></td>
                      <td width="50%" style="padding: 12px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                        <span style="font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Placed On</span>
                        <div style="font-size: 14px; font-weight: 700; color: #111827; margin-top: 4px;">${orderTime}</div>
                        <span style="font-size: 11px; color: #6B7280;">IST (India)</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer & Shipping Information -->
              <tr>
                <td style="padding: 0 24px 16px;">
                  <div style="background: #FBFAF6; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px;">
                    <h3 style="margin: 0 0 12px; font-size: 15px; color: #1C3121; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px;">
                      👤 Customer & Shipping Details
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.6; color: #374151;">
                      <tr>
                        <td width="30%" style="font-weight: 600; color: #4B5563; padding: 3px 0;">Name:</td>
                        <td style="color: #111827; font-weight: 600;">${safeCustomerName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #4B5563; padding: 3px 0;">Email:</td>
                        <td><a href="mailto:${safeCustomerEmail}" style="color: #C4883E; text-decoration: none;">${safeCustomerEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #4B5563; padding: 3px 0;">Phone:</td>
                        <td><a href="tel:${safeCustomerPhone}" style="color: #111827; text-decoration: none; font-weight: 600;">${safeCustomerPhone}</a></td>
                      </tr>
                      <tr>
                        <td valign="top" style="font-weight: 600; color: #4B5563; padding: 3px 0;">Address:</td>
                        <td style="color: #111827;">${formattedAddress}</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Order Items Breakdown -->
              <tr>
                <td style="padding: 0 24px 16px;">
                  <h3 style="margin: 0 0 10px; font-size: 15px; color: #1C3121; text-transform: uppercase; letter-spacing: 0.5px;">
                    📦 Ordered Items (${order.order_items?.length || 0})
                  </h3>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #F9FAFB;">
                        <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Product</th>
                        <th style="padding: 10px 14px; text-align: center; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Qty</th>
                        <th style="padding: 10px 14px; text-align: right; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Payment & Technical IDs -->
              <tr>
                <td style="padding: 0 24px 24px;">
                  <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #4B5563;">
                    <div style="margin-bottom: 4px;"><strong>Razorpay Payment ID:</strong> <code style="color: #1F2937;">${safeRazorpayPaymentId}</code></div>
                    <div style="margin-bottom: 4px;"><strong>Razorpay Order ID:</strong> <code style="color: #1F2937;">${safeRazorpayOrderId}</code></div>
                    <div style="margin-bottom: 4px;"><strong>Shiprocket Shipment:</strong> <code style="color: #1F2937;">${safeShiprocketShipmentId}</code></div>
                  </div>
                </td>
              </tr>

              <!-- Action Button -->
              <tr>
                <td style="padding: 0 24px 28px; text-align: center;">
                  <a href="${directTrackingUrl}" target="_blank" style="display: inline-block; background-color: #1C3121; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    View / Track Order Live ➔
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #FBFAF6; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
                  FarmSmith Automated Notification System
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const adminSubject = sanitizeHeaderValue(`🛒 [NEW ORDER] #${order.order_number} - ${formatPrice(order.total_amount)} from ${order.customer_name || "Customer"}`);

    console.log(`[AdminEmail] Dispatching Resend API admin alert for ${order.order_number} to ${recipientAdminEmail}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [recipientAdminEmail],
        subject: adminSubject,
        html: adminHtmlContent,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(`[AdminEmail] Resend API error (${response.status}) for admin alert ${order.order_number}:`, errBody);
      return { success: false, error: `Resend API HTTP ${response.status}: ${errBody}` };
    }

    const resData = await response.json();
    dispatchedAdminEmails.add(orderId);
    console.log(`[AdminEmail] Admin notification email sent for order ${order.order_number}. Resend ID: ${resData?.id}`);

    return { success: true, messageId: resData?.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[AdminEmail] Error sending admin notification for order ${orderId}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Sends a branded order confirmation email to the customer using Resend,
 * and also dispatches the admin notification alert.
 * Safe to be called asynchronously in background tasks.
 * Idempotent: checks if confirmation email was already dispatched.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<SendEmailResult> {
  console.log(`[Email] Invoked sendOrderConfirmationEmail for orderId: ${orderId}`);

  // Trigger Admin Notification in parallel
  sendAdminOrderNotificationEmail(orderId).catch((adminErr) => {
    console.error(`[Email] Background admin notification error for order ${orderId}:`, adminErr);
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn(`[Email] RESEND_API_KEY not configured in environment variables. Skipping confirmation email for order ${orderId}`);
    return { success: false, skipped: true, error: "RESEND_API_KEY missing" };
  } else {
    console.log(`[Email] RESEND_API_KEY is present (prefix: ${resendApiKey.substring(0, 4)}...)`);
  }

  if (dispatchedOrderEmails.has(orderId)) {
    console.log(`[Email] Order confirmation email already dispatched for order ${orderId}. Skipping duplicate.`);
    return { success: true, skipped: true };
  }

  try {
    const supabase = createAdminSupabaseClient();

    // Fetch complete order & items data
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_name,
          unit_price,
          quantity,
          subtotal,
          tax_amount
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error(`[Email] Failed to load order ${orderId} for email send:`, orderErr?.message);
      return { success: false, error: orderErr?.message || "Order not found" };
    }

    console.log(`[Email] Loaded order ${order.order_number} for customer: ${order.customer_email} (items: ${order.order_items?.length || 0})`);

    if (!order.customer_email) {
      console.warn(`[Email] Order ${orderId} (${order.order_number}) has no customer_email. Skipping.`);
      return { success: false, skipped: true, error: "No customer_email on order" };
    }

    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://farm-smith.vercel.app";
    const directTrackingUrl = `${siteUrl}/order/${encodeURIComponent(order.order_number)}?token=${encodeURIComponent(order.tracking_token || "")}`;
    const generalTrackingUrl = `${siteUrl}/track`;
    
    const contactEmail = process.env.CONTACT_EMAIL;
    const rawSupportEmail = contactEmail
      ? (contactEmail.includes("<") ? contactEmail.match(/<([^>]+)>/)?.[1] || contactEmail : contactEmail)
      : "farmsmith6@gmail.com";

    // Explicitly configured to FarmSmith <onboarding@resend.dev> for testing Resend email delivery without custom domain setup
    const senderEmail = "FarmSmith <onboarding@resend.dev>";

    // Escape dynamic parameters for HTML injection prevention
    const safeOrderNumber = escapeHtml(order.order_number);
    const safeCustomerName = escapeHtml(order.customer_name || "Valued Customer");
    const safeTrackingToken = escapeHtml(order.tracking_token || "");
    const safeCustomerPhone = escapeHtml(order.customer_phone || "");

    // Build items HTML table rows
    const itemsHtml = (order.order_items || [])
      .map(
        (item: { product_name: string; quantity: number; unit_price: number; subtotal?: number }) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #1F2937;">
            <strong>${escapeHtml(item.product_name)}</strong>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #4B5563; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #1F2937; text-align: right; font-weight: 600;">
            ${formatPrice(item.subtotal || item.unit_price * item.quantity)}
          </td>
        </tr>
      `
      )
      .join("");

    const shippingAddr = (order.shipping_address as Record<string, string>) || {};
    const addressCityStatePin = [
      shippingAddr.city ? escapeHtml(shippingAddr.city) : "",
      shippingAddr.state ? escapeHtml(shippingAddr.state) : "",
      shippingAddr.pincode ? escapeHtml(shippingAddr.pincode) : "",
    ]
      .filter(Boolean)
      .join(", ");

    const formattedAddress = [
      shippingAddr.line1 ? escapeHtml(shippingAddr.line1) : null,
      shippingAddr.line2 ? escapeHtml(shippingAddr.line2) : null,
      addressCityStatePin || null,
      "India",
    ]
      .filter(Boolean)
      .join("<br/>");

    // Construct premium HTML email template
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${safeOrderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F4F6F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C3121;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F4F6F4; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #1C3121; padding: 32px 24px; text-align: center;">
                  <h1 style="margin: 0; color: #FDFBF7; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">🌿 FarmSmith</h1>
                  <p style="margin: 6px 0 0; color: #E2E8F0; font-size: 14px; opacity: 0.9;">Pure & Fresh Direct From Farms</p>
                </td>
              </tr>

              <!-- Greeting & Status -->
              <tr>
                <td style="padding: 32px 28px 16px;">
                  <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                    <span style="color: #15803D; font-weight: 600; font-size: 15px;">✓ Payment Verified & Order Confirmed</span>
                  </div>

                  <h2 style="margin: 0 0 8px; font-size: 20px; color: #1C3121;">Thank you for your order, ${safeCustomerName}!</h2>
                  <p style="margin: 0 0 20px; font-size: 15px; color: #4B5563; line-height: 1.6;">
                    We have received your order <strong>${safeOrderNumber}</strong> and are preparing it for shipment.
                  </p>
                </td>
              </tr>

              <!-- Important Tracking Credentials Box -->
              <tr>
                <td style="padding: 0 28px 24px;">
                  <div style="background-color: #FBFAF6; border: 1.5px dashed #C4883E; border-radius: 12px; padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 10px; font-size: 16px; color: #1C3121;">📦 Order Tracking Credentials</h3>
                    
                    <p style="margin: 0 0 6px; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                    <p style="margin: 0 0 14px; font-size: 18px; font-weight: 700; color: #1C3121; font-family: monospace;">${safeOrderNumber}</p>
                    
                    <p style="margin: 0 0 6px; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Access Key</p>
                    <div style="background: #FFFFFF; border: 1px solid #E5E7EB; padding: 10px 14px; border-radius: 8px; display: inline-block; margin-bottom: 16px;">
                      <code style="font-size: 15px; font-weight: 700; color: #C4883E; font-family: monospace; letter-spacing: 0.5px;">${safeTrackingToken}</code>
                    </div>

                    <div>
                      <a href="${directTrackingUrl}" target="_blank" style="display: inline-block; background-color: #1C3121; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Track Your Order Directly ➔
                      </a>
                    </div>
                    <p style="margin: 12px 0 0; font-size: 12px; color: #6B7280;">
                      Or enter your key anytime at <a href="${generalTrackingUrl}" style="color: #C4883E; text-decoration: underline;">${generalTrackingUrl}</a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Items Summary Table -->
              <tr>
                <td style="padding: 0 28px 24px;">
                  <h3 style="margin: 0 0 12px; font-size: 16px; color: #1C3121; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">Order Summary</h3>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr style="background-color: #F9FAFB;">
                        <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Product</th>
                        <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Qty</th>
                        <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: 600;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Totals Breakdown & Delivery Address -->
              <tr>
                <td style="padding: 0 28px 32px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <!-- Delivery Address -->
                      <td width="55%" valign="top" style="padding-right: 16px;">
                        <h4 style="margin: 0 0 6px; font-size: 14px; color: #1C3121;">Shipping Address</h4>
                        <p style="margin: 0; font-size: 13px; color: #4B5563; line-height: 1.5;">
                          <strong>${safeCustomerName}</strong><br/>
                          ${formattedAddress}<br/>
                          ${safeCustomerPhone ? `Phone: ${safeCustomerPhone}` : ""}
                        </p>
                      </td>

                      <!-- Payment Totals -->
                      <td width="45%" valign="top">
                        <div style="background: #F9FAFB; padding: 14px 16px; border-radius: 8px;">
                          <div style="display: flex; justify-space-between; margin-bottom: 6px; font-size: 13px; color: #4B5563;">
                            <span>Subtotal:</span>
                            <span style="font-weight: 600; float: right;">${formatPrice(order.subtotal_amount)}</span>
                          </div>
                          <div style="display: flex; justify-space-between; margin-bottom: 6px; font-size: 13px; color: #4B5563;">
                            <span>Shipping:</span>
                            <span style="font-weight: 600; float: right;">${order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "FREE"}</span>
                          </div>
                          ${
                            order.tax_amount > 0
                              ? `
                          <div style="display: flex; justify-space-between; margin-bottom: 6px; font-size: 13px; color: #4B5563;">
                            <span>GST / Taxes:</span>
                            <span style="font-weight: 600; float: right;">${formatPrice(order.tax_amount)}</span>
                          </div>`
                              : ""
                          }
                          <div style="border-top: 1px solid #E5E7EB; margin-top: 8px; padding-top: 8px; font-size: 15px; font-weight: 700; color: #1C3121;">
                            <span>Total Paid:</span>
                            <span style="color: #15803D; float: right;">${formatPrice(order.total_amount)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #FBFAF6; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 6px; font-size: 13px; color: #4B5563;">Questions about your order?</p>
                  <p style="margin: 0; font-size: 13px;">
                    Contact our support team at <a href="mailto:${rawSupportEmail}" style="color: #C4883E; font-weight: 600; text-decoration: none;">${rawSupportEmail}</a>
                  </p>
                  <p style="margin: 16px 0 0; font-size: 11px; color: #9CA3AF;">
                    © ${new Date().getFullYear()} FarmSmith Foods. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const emailSubject = sanitizeHeaderValue(`Order Confirmation #${order.order_number} - FarmSmith`);

    // Send HTTP POST request to Resend API
    console.log(`[Email] Dispatching Resend API request for ${order.order_number}: from="${senderEmail}", to=["${order.customer_email}"], subject="${emailSubject}"`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [order.customer_email],
        subject: emailSubject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(`[Email] Resend API error (${response.status}) for order ${order.order_number}:`, errBody);
      return { success: false, error: `Resend API HTTP ${response.status}: ${errBody}` };
    }

    const resData = await response.json();
    dispatchedOrderEmails.add(orderId);
    console.log(`[Email] Order confirmation email successfully sent for ${order.order_number}. Resend ID: ${resData?.id}`);

    return { success: true, messageId: resData?.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Email] Error sending order confirmation email for order ${orderId}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

