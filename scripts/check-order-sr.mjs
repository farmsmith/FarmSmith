import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*");

  console.log("=== DB ORDERS ===");
  console.log(orders?.map(o => ({
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    awb_code: o.awb_code,
    courier_name: o.courier_name,
    shiprocket_order_id: o.shiprocket_order_id,
    shiprocket_shipment_id: o.shiprocket_shipment_id
  })));

  const email = env.SHIPROCKET_EMAIL;
  const password = env.SHIPROCKET_PASSWORD;
  
  if (!email || !password) {
    console.log("No shiprocket credentials in env");
    return;
  }

  const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authRes.json();
  const token = authData.token;
  console.log("Shiprocket token obtained:", !!token);

  for (const o of (orders || [])) {
    console.log(`\n=== CHECKING SHIPROCKET FOR ORDER ${o.order_number} ===`);
    const srRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?channel_order_id=${encodeURIComponent(o.order_number)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const srData = await srRes.json();
    console.log("Shiprocket response for", o.order_number, ":", JSON.stringify(srData, null, 2));

    // Also check by Shiprocket order ID if present
    if (o.shiprocket_order_id) {
      const byIdRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${o.shiprocket_order_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const byIdData = await byIdRes.json();
      console.log("Shiprocket orders/show response:", JSON.stringify(byIdData, null, 2));
    }
  }
}

check().catch(console.error);
