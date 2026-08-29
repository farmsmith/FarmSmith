import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
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

const targetSlugs = [
  'cold-pressed-mustard-oil',
  'gi-tagged-aromatic-rice',
  'unpolished-arhar-daal',
  'ancient-grains-pulses-mix',
  'whole-ground-spice-pack'
];

async function cleanup() {
  console.log("Deactivating all products except the 5 launch products...");

  // Deactivate all products not in targetSlugs
  const { data: deactivated, error: deactivateErr } = await supabase
    .from('products')
    .update({ is_active: false })
    .not('slug', 'in', `("${targetSlugs.join('","')}")`)
    .select();

  if (deactivateErr) {
    console.error("Error deactivating other products:", deactivateErr.message);
  } else {
    console.log(`Deactivated ${deactivated?.length || 0} older products.`);
  }

  // Ensure target 5 products are active
  const { data: activated, error: activateErr } = await supabase
    .from('products')
    .update({ is_active: true })
    .in('slug', targetSlugs)
    .select();

  if (activateErr) {
    console.error("Error activating target products:", activateErr.message);
  } else {
    console.log(`Activated ${activated?.length || 0} target launch products.`);
  }

  console.log("Cleanup complete! Only the 5 launch products are active in database.");
}

cleanup();
