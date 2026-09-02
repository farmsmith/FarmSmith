import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const content = fs.readFileSync(".env.local", "utf8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...val] = trimmed.split("=");
        process.env[key.trim()] = val.join("=").trim();
      }
    });
  } catch (err) {
    console.error("Could not load .env.local", err);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(url, key);

async function findOrder() {
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, tracking_token, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching order:", error);
    return;
  }

  console.log("Recent Orders in DB:");
  console.log(data);
}

findOrder();
