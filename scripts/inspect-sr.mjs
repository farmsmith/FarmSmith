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

async function check() {
  const email = env.SHIPROCKET_EMAIL;
  const password = env.SHIPROCKET_PASSWORD;

  const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authRes.json();
  const token = authData.token;

  const orderNumber = "FS-2026-4C6E0A";
  const srRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?channel_order_id=${encodeURIComponent(orderNumber)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const srData = await srRes.json();
  const item = srData?.data?.[0];
  console.log("Keys in item:", Object.keys(item || {}));
  console.log("shipments in item:", JSON.stringify(item?.shipments, null, 2));
  console.log("awb_data:", item?.awb_data);
  console.log("item.awb_code:", item?.awb_code);
  console.log("item.courier_name:", item?.courier_name);
}

check().catch(console.error);
