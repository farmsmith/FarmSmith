const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envFile = fs.readFileSync("c:/Users/Sachin/OneDrive/Desktop/free-demo-websites/farmsmith-nextjs-updated-backend/farmsmith/.env.local", "utf8");
let supabaseUrl = "";
let supabaseSecret = "";

for (const line of envFile.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    supabaseUrl = line.split("=")[1].trim();
  }
  if (line.startsWith("SUPABASE_SECRET_KEY=")) {
    supabaseSecret = line.split("=")[1].trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseSecret);

async function main() {
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("*");

  if (error) {
    console.error("Error fetching shipping_rates:", error);
    return;
  }

  console.log("SHIPPING_RATES IN SUPABASE:", JSON.stringify(data, null, 2));
}

main();
