import { handleShiprocketWebhook } from "@/lib/shipping/fulfillment-webhook";

export async function POST(request: Request) {
  return handleShiprocketWebhook(request);
}
