-- ============================================
-- FarmSmith Foods — Catalog Seed SQL (Fixed Deterministic UUIDs)
-- ============================================

-- Deactivate any previous products not in the official line-up
UPDATE products
SET is_active = false
WHERE slug NOT IN (
  'kandhamal-turmeric-powder',
  'cold-pressed-mustard-oil',
  'gi-tagged-aromatic-rice',
  'unpolished-arhar-daal',
  'ancient-grains-pulses-mix',
  'whole-ground-spice-pack'
);

-- Insert or update official 6 product line-up with fixed UUIDs
INSERT INTO products (
  id,
  name,
  slug,
  sku,
  short_description,
  description,
  category,
  price,
  currency,
  unit,
  weight_grams,
  gst_rate,
  image_url,
  stock_quantity,
  is_active
) VALUES
(
  'cd096cd8-1104-41c5-9539-46a87b5b96c1',
  'Farmsmith Turmeric Powder',
  'kandhamal-turmeric-powder',
  'FS-TURMERIC-001',
  'Pure GI-tagged Kandhamal turmeric powder with high curcumin content and batch test reports.',
  'Sourced directly from Kandhamal organic farming clusters in Odisha. 100% pure, unadulterated, and rich in natural curcumin.',
  'Other spices whole and powder',
  129.00,
  'INR',
  '100g',
  100,
  5.0,
  '/images/product_turmeric.png',
  92,
  true
),
(
  '00000000-0000-4000-a000-000000000002',
  'Cold-Pressed Kachi Ghani Mustard Oil',
  'cold-pressed-mustard-oil',
  'FS-OIL-001',
  'Pure traditional cold-pressed mustard oil with natural aroma & rich nutrients. Launching Soon!',
  'Extracted slowly using wooden ghani methods without synthetic heat or chemicals, preserving original antioxidants.',
  'Oil',
  249.00,
  'INR',
  '500ml',
  500,
  5.0,
  '/images/product_turmeric.png',
  50,
  true
),
(
  '00000000-0000-4000-a000-000000000003',
  'GI-Tagged Organic Aromatic Rice',
  'gi-tagged-aromatic-rice',
  'FS-RICE-001',
  'Unpolished GI-tagged aromatic rice harvested from natural spring water farms. Launching Soon!',
  'Single-origin heritage rice grown with zero pesticides, featuring natural aroma and high fiber content.',
  'Rice',
  199.00,
  'INR',
  '1 kg',
  1000,
  5.0,
  '/images/product_turmeric.png',
  50,
  true
),
(
  '00000000-0000-4000-a000-000000000004',
  'Unpolished Organic Arhar Daal (Toor)',
  'unpolished-arhar-daal',
  'FS-DAAL-001',
  'High-protein, unpolished organic yellow lentils direct from farm gates. Launching Soon!',
  'Unpolished yellow split pulses containing zero artificial color or mineral oil treatment.',
  'Daal',
  149.00,
  'INR',
  '1 kg',
  1000,
  5.0,
  '/images/product_turmeric.png',
  50,
  true
),
(
  '00000000-0000-4000-a000-000000000005',
  'FarmFresh Ancient Grains & Pulses Mix',
  'ancient-grains-pulses-mix',
  'FS-GRAIN-001',
  'Nutrient-dense ancient grains and organic whole pulses blend. Launching Soon!',
  'A balanced superfood mixture of millets, moong, and wild grains crafted for daily nutritious meals.',
  'Other grains and pulses',
  179.00,
  'INR',
  '1 kg',
  1000,
  5.0,
  '/images/product_turmeric.png',
  50,
  true
),
(
  '00000000-0000-4000-a000-000000000006',
  'Hand-Selected Whole & Ground Spice Pack',
  'whole-ground-spice-pack',
  'FS-SPICE-001',
  'Batch-tested aromatic whole spices and freshly milled pure powders. Launching Soon!',
  'Pure single-origin spices solar-dried and crushed to retain natural essential oils and vibrant flavors.',
  'Other spices whole and powder',
  299.00,
  'INR',
  '250g',
  250,
  5.0,
  '/images/product_turmeric.png',
  50,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  weight_grams = EXCLUDED.weight_grams,
  short_description = EXCLUDED.short_description,
  stock_quantity = EXCLUDED.stock_quantity,
  is_active = true;
