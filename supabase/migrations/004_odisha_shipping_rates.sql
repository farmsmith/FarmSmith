-- Add district column to shipping_rates if not exists
alter table shipping_rates add column if not exists district text;

-- Clear old starter rules and insert exact Odisha & All India shipping rates (Standard rates, NO free shipping)
truncate table shipping_rates;

-- Standard ₹60 delivery fee for Odisha & All India
insert into shipping_rates (name, state, min_order_amount, shipping_amount, is_active)
values 
  ('All India Standard Shipping (₹60)', null, 0, 60, true);
