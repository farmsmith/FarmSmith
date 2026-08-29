-- Add district column to shipping_rates if not exists
alter table shipping_rates add column if not exists district text;

-- Clear old starter rules and insert exact Odisha & All India shipping rates
truncate table shipping_rates;

-- 1. Free shipping based on Pincode Prefixes for Khordha (751, 752), Cuttack (753), Jagatsinghpur (7541, 7542)
insert into shipping_rates (name, state, pincode_prefix, min_order_amount, shipping_amount, is_active)
values 
  ('Bhubaneswar & Khordha Pincode Free Shipping', 'Odisha', '751', 0, 0, true),
  ('Khordha District Pincode Free Shipping', 'Odisha', '752', 0, 0, true),
  ('Cuttack City Pincode Free Shipping', 'Odisha', '753', 0, 0, true),
  ('Jagatsinghpur & Rural Pincode Free Shipping 1', 'Odisha', '7541', 0, 0, true),
  ('Jagatsinghpur & Rural Pincode Free Shipping 2', 'Odisha', '7542', 0, 0, true);

-- 2. Free shipping based on District Names fallback
insert into shipping_rates (name, state, district, min_order_amount, shipping_amount, is_active)
values 
  ('Jagatsinghpur District Name Free Shipping', 'Odisha', 'Jagatsinghpur', 0, 0, true),
  ('Cuttack District Name Free Shipping', 'Odisha', 'Cuttack', 0, 0, true),
  ('Khordha District Name Free Shipping', 'Odisha', 'Khordha', 0, 0, true),
  ('Bhubaneswar City Name Free Shipping', 'Odisha', 'Bhubaneswar', 0, 0, true);

-- 3. Standard ₹60 delivery fee for all other districts in Odisha & all other States in India
insert into shipping_rates (name, state, min_order_amount, shipping_amount, is_active)
values 
  ('All India Standard Shipping (₹60)', null, 0, 60, true);
