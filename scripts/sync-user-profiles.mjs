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

async function syncUserProfiles() {
  console.log("Checking Supabase auth users & customer profiles...");

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Error listing auth users:", authError.message);
    return;
  }

  console.log(`Found ${authData.users.length} auth users in database.`);

  for (const user of authData.users) {
    const fullName = user.user_metadata?.full_name || null;
    const phone = user.user_metadata?.phone || null;

    console.log(`User: ${user.email} | Name: ${fullName || 'N/A'} | Phone: ${phone || 'N/A'}`);

    const { error: profileError } = await supabase
      .from('customer_profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.warn(`Notice upserting profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`✓ Profile synced in customer_profiles for ${user.email}`);
    }
  }

  console.log("Done checking and syncing database profiles!");
}

syncUserProfiles();
