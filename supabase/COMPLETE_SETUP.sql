-- ==============================================================================
-- FARMSMITH FOODS — COMPLETE MASTER DATABASE SETUP
-- Run this ONCE in your new Supabase Project's SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. PRODUCTS TABLE
-- ==============================================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text,
  short_description text,
  description text,
  category text,
  price numeric(10,2) not null check (price >= 0),
  currency text not null default 'INR',
  unit text,
  weight_grams integer,
  gst_rate numeric(5,2) not null default 0 check (gst_rate >= 0 and gst_rate <= 100),
  image_url text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_products_sku_unique on products(sku) where sku is not null;
create index if not exists idx_products_active_category on products(is_active, category);

-- ==============================================================================
-- 2. PRODUCT IMAGES (GALLERY)
-- ==============================================================================
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_sort on product_images(product_id, sort_order);
create unique index if not exists idx_product_images_one_primary on product_images(product_id) where is_primary = true;

-- ==============================================================================
-- 3. SHIPPING RATES
-- ==============================================================================
create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  pincode_prefix text,
  min_order_amount numeric(10,2) not null default 0 check (min_order_amount >= 0),
  shipping_amount numeric(10,2) not null check (shipping_amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shipping_rates_lookup on shipping_rates(is_active, state, pincode_prefix, min_order_amount desc);

-- ==============================================================================
-- 4. CUSTOMER PROFILES (Synced with Supabase Auth)
-- ==============================================================================
create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  default_shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create customer profile on signup trigger
create or replace function public.handle_new_customer_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, customer_profiles.full_name),
    phone = coalesce(excluded.phone, customer_profiles.phone),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_signup();

-- ==============================================================================
-- 5. ORDERS TABLE (With Shiprocket & Financials)
-- ==============================================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  tracking_token text not null unique,

  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,

  subtotal_amount numeric(10,2) not null default 0 check (subtotal_amount >= 0),
  taxable_amount numeric(10,2) not null default 0 check (taxable_amount >= 0),
  shipping_amount numeric(10,2) not null default 0 check (shipping_amount >= 0),
  tax_amount numeric(10,2) not null default 0 check (tax_amount >= 0),
  cgst_amount numeric(10,2) not null default 0 check (cgst_amount >= 0),
  sgst_amount numeric(10,2) not null default 0 check (sgst_amount >= 0),
  igst_amount numeric(10,2) not null default 0 check (igst_amount >= 0),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  currency text not null default 'INR',

  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'payment_captured_after_expiry'
    )),

  razorpay_order_id text unique,
  razorpay_payment_id text unique,

  shiprocket_order_id text,
  shiprocket_shipment_id text,
  awb_code text,
  courier_name text,
  fulfillment_status text not null default 'pending'
    check (fulfillment_status in ('pending', 'creating', 'created', 'failed')),
  shiprocket_error text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer on orders(customer_id, created_at desc);
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_orders_order_number on orders(order_number);
create index if not exists idx_orders_tracking_token on orders(tracking_token);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_awb_code on orders(awb_code) where awb_code is not null;
create unique index if not exists idx_orders_shiprocket_order_id_unique on orders(shiprocket_order_id) where shiprocket_order_id is not null;

-- ==============================================================================
-- 6. ORDER ITEMS TABLE
-- ==============================================================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  gst_rate numeric(5,2) not null default 0 check (gst_rate >= 0 and gst_rate <= 100),
  tax_amount numeric(10,2) not null default 0 check (tax_amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- ==============================================================================
-- 7. CART ITEMS TABLE
-- ==============================================================================
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_cart_items_user on cart_items(user_id);

-- ==============================================================================
-- 8. CONTACT INQUIRIES
-- ==============================================================================
create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_inquiries_created on contact_inquiries(created_at desc);

-- ==============================================================================
-- 9. PRODUCT REVIEWS
-- ==============================================================================
create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_email text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null,
  content text not null,
  is_verified_buyer boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_reviews_approved on product_reviews(product_id, is_approved, created_at desc);

-- Trigger to keep product rating and review count updated automatically
create or replace function public.update_product_rating_aggregates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update public.products
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.product_reviews
      where product_id = target_product_id and is_approved = true
    ), 0),
    review_count = coalesce((
      select count(*)::integer
      from public.product_reviews
      where product_id = target_product_id and is_approved = true
    ), 0),
    updated_at = now()
  where id = target_product_id;

  return null;
end;
$$;

drop trigger if exists on_review_aggregate_change on product_reviews;
create trigger on_review_aggregate_change
  after insert or update or delete on product_reviews
  for each row execute function public.update_product_rating_aggregates();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table products enable row level security;
alter table product_images enable row level security;
alter table shipping_rates enable row level security;
alter table customer_profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table cart_items enable row level security;
alter table contact_inquiries enable row level security;
alter table product_reviews enable row level security;

-- Products: Everyone can view active products
create policy "Anyone can view active products" on products for select using (is_active = true);

-- Product Images: Everyone can view
create policy "Anyone can view product images" on product_images for select using (true);

-- Shipping Rates: Everyone can view active rates
create policy "Anyone can view active shipping rates" on shipping_rates for select using (is_active = true);

-- Customer Profiles: Users can manage their own profile
create policy "Users can view own profile" on customer_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on customer_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on customer_profiles for insert with check (auth.uid() = id);

-- Cart Items: Users can manage their own cart
create policy "Users can view own cart" on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart" on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart" on cart_items for delete using (auth.uid() = user_id);

-- Product Reviews: Everyone can read approved reviews, authenticated users can insert
create policy "Anyone can view approved reviews" on product_reviews for select using (is_approved = true);
create policy "Users can submit reviews" on product_reviews for insert with check (true);

-- Contact Inquiries: Anyone can submit inquiries
create policy "Anyone can submit contact inquiry" on contact_inquiries for insert with check (true);

-- ==============================================================================
-- 11. INITIAL SEED DATA (Products & Shipping Rates)
-- ==============================================================================
insert into shipping_rates (name, state, pincode_prefix, min_order_amount, shipping_amount, is_active)
values 
  ('All India Standard Delivery', null, null, 0, 60.00, true)
on conflict do nothing;

insert into products (name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active)
values
  ('Farmsmith Turmeric Powder', 'kandhamal-turmeric-powder', 'FS-TURMERIC-001', 'Pure GI-tagged Kandhamal turmeric powder with high curcumin content and batch test reports.', 'Sourced directly from Kandhamal organic farming clusters in Odisha. 100% pure, unadulterated, and rich in natural curcumin.', 'Powdered Spices', 129.00, 'INR', '100g', 100, 5.0, '/images/Product 1.PNG', 100, true)
on conflict (slug) do update set
  stock_quantity = 100,
  price = 129.00,
  is_active = true,
  updated_at = now();