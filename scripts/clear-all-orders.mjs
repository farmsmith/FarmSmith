import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const content = fs.readFileSync(".env.local", "utf8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...val] = trimmed.split("=");
        process.env[key.trim()] = val.join("=").trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (err) {
    console.error("Could not load .env.local", err);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Missing Supabase URL or Secret Key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function clearOrders() {
  console.log("Checking current orders in DB...");
  const { data: existingOrders, error: fetchErr } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at");

  if (fetchErr) {
    console.error("Error fetching orders:", fetchErr);
    return;
  }

  console.log(`Found ${existingOrders?.length || 0} existing orders.`);

  // 1. Delete order_items
  const { error: itemsErr } = await supabase
    .from("order_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (itemsErr) {
    console.error("Error clearing order_items:", itemsErr);
  } else {
    console.log("✓ Cleared all order_items successfully.");
  }

  // 2. Delete orders
  const { error: ordersErr } = await supabase
    .from("orders")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (ordersErr) {
    console.error("Error clearing orders:", ordersErr);
  } else {
    console.log("✓ Cleared all orders successfully.");
  }

  // 3. Verify
  const { data: remainingOrders } = await supabase
    .from("orders")
    .select("id");

  const { data: remainingItems } = await supabase
    .from("order_items")
    .select("id");

  console.log(`\nVerification:`);
  console.log(`Remaining Orders: ${remainingOrders?.length || 0}`);
  console.log(`Remaining Order Items: ${remainingItems?.length || 0}`);
}

clearOrders();
