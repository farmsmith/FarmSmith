import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.warn("Could not read .env.local", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log("Checking current shipping_rates...");
  const { data: beforeRates, error: selectErr } = await supabase
    .from('shipping_rates')
    .select('*');

  if (selectErr) {
    console.error("Error fetching shipping_rates:", selectErr);
    process.exit(1);
  }

  console.log("Before migration shipping_rates:", beforeRates);

  console.log("Deleting free shipping rates (shipping_amount <= 0 OR name ILIKE '%free%')...");
  const { data: deletedRates, error: deleteErr } = await supabase
    .from('shipping_rates')
    .delete()
    .or('shipping_amount.lte.0,name.ilike.%free%')
    .select();

  if (deleteErr) {
    console.error("Error deleting free shipping rates:", deleteErr);
    process.exit(1);
  }

  console.log("Deleted rates count:", deletedRates?.length || 0);
  console.log("Deleted rates details:", deletedRates);

  const { data: afterRates } = await supabase
    .from('shipping_rates')
    .select('*');

  console.log("After migration shipping_rates:", afterRates);
}

runMigration();
