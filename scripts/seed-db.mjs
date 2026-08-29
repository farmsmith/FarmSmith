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

const targetProducts = [
  {
    name: 'Farmsmith Turmeric Powder',
    slug: 'kandhamal-turmeric-powder',
    sku: 'FS-TURMERIC-001',
    short_description: 'Pure GI-tagged Kandhamal turmeric powder with high curcumin content and batch test reports.',
    description: 'Sourced directly from Kandhamal organic farming clusters in Odisha. 100% pure, unadulterated, and rich in natural curcumin.',
    category: 'Powdered Spices',
    price: 129.00,
    currency: 'INR',
    unit: '100g',
    weight_grams: 100,
    gst_rate: 5.0,
    image_url: '/images/product_turmeric.png',
    stock_quantity: 100,
    is_active: true
  },
  {
    name: 'Cold-Pressed Kachi Ghani Mustard Oil',
    slug: 'cold-pressed-mustard-oil',
    sku: 'FS-OIL-001',
    short_description: 'Pure traditional cold-pressed mustard oil with natural aroma & rich nutrients. Launching Soon!',
    description: 'Extracted slowly using wooden ghani methods without synthetic heat or chemicals, preserving original antioxidants.',
    category: 'Oil',
    price: 249.00,
    currency: 'INR',
    unit: '500ml',
    weight_grams: 500,
    gst_rate: 5.0,
    image_url: '/images/product_mustard_oil.png',
    stock_quantity: 50,
    is_active: true
  },
  {
    name: 'GI-Tagged Organic Aromatic Rice',
    slug: 'gi-tagged-aromatic-rice',
    sku: 'FS-RICE-001',
    short_description: 'Unpolished GI-tagged aromatic rice harvested from natural spring water farms. Launching Soon!',
    description: 'Single-origin heritage rice grown with zero pesticides, featuring natural aroma and high fiber content.',
    category: 'Rice',
    price: 199.00,
    currency: 'INR',
    unit: '1 kg',
    weight_grams: 1000,
    gst_rate: 5.0,
    image_url: '/images/product_aromatic_rice.png',
    stock_quantity: 50,
    is_active: true
  },
  {
    name: 'Unpolished Organic Arhar Daal (Toor)',
    slug: 'unpolished-arhar-daal',
    sku: 'FS-DAAL-001',
    short_description: 'High-protein, unpolished organic yellow lentils direct from farm gates. Launching Soon!',
    description: 'Unpolished yellow split pulses containing zero artificial color or mineral oil treatment.',
    category: 'Daal',
    price: 149.00,
    currency: 'INR',
    unit: '1 kg',
    weight_grams: 1000,
    gst_rate: 5.0,
    image_url: '/images/product_arhar_daal.png',
    stock_quantity: 50,
    is_active: true
  },
  {
    name: 'FarmFresh Ancient Grains & Pulses Mix',
    slug: 'ancient-grains-pulses-mix',
    sku: 'FS-GRAIN-001',
    short_description: 'Nutrient-dense ancient grains and organic whole pulses blend. Launching Soon!',
    description: 'A balanced superfood mixture of millets, moong, and wild grains crafted for daily nutritious meals.',
    category: 'Grains / Pulses',
    price: 179.00,
    currency: 'INR',
    unit: '1 kg',
    weight_grams: 1000,
    gst_rate: 5.0,
    image_url: '/images/product_ancient_grains.png',
    stock_quantity: 50,
    is_active: true
  }
];

async function syncCatalog() {
  console.log("Cleaning catalog in Supabase database...");

  const validSlugs = targetProducts.map(p => p.slug);

  // Deactivate or remove non-matching products
  const { error: deactivateError } = await supabase
    .from('products')
    .update({ is_active: false })
    .not('slug', 'in', `(${validSlugs.map(s => `'${s}'`).join(',')})`);

  if (deactivateError) {
    console.warn("Deactivation notice:", deactivateError.message);
  }

  // Insert or update target products and gallery images
  for (const item of targetProducts) {
    const { data: savedProduct, error } = await supabase
      .from('products')
      .upsert(item, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`Error saving ${item.name}:`, error.message);
      continue;
    }

    console.log(`✓ Preserved/Saved: ${item.name} (₹${item.price} / ${item.unit})`);

    // Gallery images per product
    const primaryUrl = item.image_url;
    let farmUrl = "/images/origin_story.png";
    let useUrl = "/images/recipe_golden_milk.png";
    let testUrl = "/images/awareness_spices.png";

    if (primaryUrl.includes("mustard_oil")) {
      farmUrl = "/images/product_mustard_oil_farm.png";
      useUrl = "/images/product_mustard_oil_use.png";
      testUrl = "/images/product_mustard_oil_test.png";
    } else if (primaryUrl.includes("aromatic_rice")) {
      farmUrl = "/images/product_aromatic_rice_farm.png";
      useUrl = "/images/product_aromatic_rice_use.png";
      testUrl = "/images/product_aromatic_rice_test.png";
    } else if (primaryUrl.includes("arhar_daal")) {
      farmUrl = "/images/product_arhar_daal_farm.png";
      useUrl = "/images/product_arhar_daal_use.png";
      testUrl = "/images/product_arhar_daal_test.png";
    } else if (primaryUrl.includes("ancient_grains")) {
      farmUrl = "/images/product_ancient_grains_farm.png";
      useUrl = "/images/product_ancient_grains_use.png";
      testUrl = "/images/product_ancient_grains_test.png";
    }

    const galleryImages = [
      { product_id: savedProduct.id, image_url: primaryUrl, alt_text: `${item.name} - Main View`, sort_order: 0, is_primary: true },
      { product_id: savedProduct.id, image_url: farmUrl, alt_text: `${item.name} - Farm Sourcing`, sort_order: 1, is_primary: false },
      { product_id: savedProduct.id, image_url: useUrl, alt_text: `${item.name} - Culinary Preparation`, sort_order: 2, is_primary: false },
      { product_id: savedProduct.id, image_url: testUrl, alt_text: `${item.name} - Quality Inspection`, sort_order: 3, is_primary: false },
    ];

    await supabase.from('product_images').delete().eq('product_id', savedProduct.id);
    const { error: galleryErr } = await supabase.from('product_images').insert(galleryImages);
    if (galleryErr) {
      console.warn(`Gallery notice for ${item.name}:`, galleryErr.message);
    } else {
      console.log(`  └─ 4 gallery images seeded for ${item.name}`);
    }
  }

  console.log("Successfully updated catalog and gallery images!");
}

syncCatalog();
