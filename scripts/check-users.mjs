import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.replace(/^"|"$/g, '');
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecret) {
  console.error("Missing Supabase URL or Secret Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecret);

async function checkUsers() {
  console.log("Fetching registered users from Supabase Auth...");

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Auth listUsers error:", authError.message);
  } else {
    console.log(`Found ${authData.users.length} registered users in Auth:`);
    authData.users.forEach((u, i) => {
      console.log(`${i + 1}. Email: ${u.email} | ID: ${u.id} | Created: ${u.created_at} | Last Sign In: ${u.last_sign_in_at || 'Never'}`);
    });
  }

  // Also check if custom profiles or orders exist
  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  if (!profError && profiles) {
    console.log(`\nProfiles Table (${profiles.length} records):`, profiles);
  }

  const { data: orders, error: ordersError } = await supabase.from('orders').select('customer_name, customer_email, customer_phone, created_at');
  if (!ordersError && orders) {
    console.log(`\nCustomer Orders Data (${orders.length} orders):`, orders);
  }
}

checkUsers();
