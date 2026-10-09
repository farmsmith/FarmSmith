-- ==============================================================================
-- FARMSMITH FOODS — COMPLETE MASTER DATABASE SETUP
-- Single file combining all migrations (001-009) + seed data.
-- Safe to run on a FRESH Supabase project or re-run on an existing one.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> Run
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
create index if not exists idx_products_active on products(is_active) where is_active = true;
create index if not exists idx_products_active_category on products(is_active, category);

-- ==============================================================================
-- 2. PRODUCT IMAGES
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
create index if not exists idx_product_images_product_id on product_images(product_id, sort_order asc);

-- ==============================================================================
-- 3. SHIPPING RATES
-- ==============================================================================
create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  district text,
  pincode_prefix text,
  min_order_amount numeric(10,2) not null default 0 check (min_order_amount >= 0),
  shipping_amount numeric(10,2) not null check (shipping_amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_shipping_rates_lookup on shipping_rates(is_active, state, pincode_prefix, min_order_amount desc);

-- ==============================================================================
-- 4. CUSTOMER PROFILES
-- ==============================================================================
create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  default_shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 5. ORDERS TABLE
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
    check (status in ('pending_payment','paid','processing','shipped','delivered','cancelled','refunded','payment_captured_after_expiry')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  shiprocket_order_id text,
  shiprocket_shipment_id text,
  awb_code text,
  courier_name text,
  fulfillment_status text not null default 'pending'
    check (fulfillment_status in ('pending','creating','created','failed')),
  shiprocket_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_order_number on orders(order_number);
create index if not exists idx_orders_tracking_token on orders(tracking_token);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_razorpay_order_id on orders(razorpay_order_id);
create index if not exists idx_orders_customer on orders(customer_id, created_at desc);
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_orders_customer_email_created on orders(customer_email, created_at desc);
create index if not exists idx_orders_customer_id_created on orders(customer_id, created_at desc) where customer_id is not null;
create unique index if not exists idx_orders_shiprocket_order_id_unique on orders(shiprocket_order_id) where shiprocket_order_id is not null;
create index if not exists idx_orders_awb_code on orders(awb_code) where awb_code is not null;
create index if not exists idx_orders_fulfillment_retry on orders(status, fulfillment_status) where status = 'paid' and fulfillment_status = 'failed';

-- ==============================================================================
-- 6. ORDER ITEMS
-- ==============================================================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
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
-- 7. INVENTORY MOVEMENTS
-- ==============================================================================
create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null,
  movement_type text not null
    check (movement_type in ('initial_stock','restock','order','cancellation','refund','adjustment')),
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_inventory_product on inventory_movements(product_id);

-- ==============================================================================
-- 8. CART ITEMS
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
-- 9. CONTACT INQUIRIES
-- ==============================================================================
create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create index if not exists idx_contact_inquiries_created on contact_inquiries(created_at desc);

-- ==============================================================================
-- 10. PRODUCT REVIEWS
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
  product_name text,
  is_verified_buyer boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_product_reviews_approved on product_reviews(product_id, is_approved, created_at desc);
create index if not exists idx_product_reviews_approved_product_created on product_reviews(product_name, created_at desc) where is_approved = true;

-- ==============================================================================
-- 11. SITE METRICS
-- ==============================================================================
create table if not exists site_metrics (
  id text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 12. UPDATED_AT TRIGGER FUNCTION + TRIGGERS
-- ==============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_products_updated_at') then
    create trigger trg_products_updated_at before update on products for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_orders_updated_at') then
    create trigger trg_orders_updated_at before update on orders for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_customer_profiles_updated_at') then
    create trigger trg_customer_profiles_updated_at before update on customer_profiles for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_shipping_rates_updated_at') then
    create trigger trg_shipping_rates_updated_at before update on shipping_rates for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_cart_items_updated_at') then
    create trigger trg_cart_items_updated_at before update on cart_items for each row execute function set_updated_at();
  end if;
end; $$;

-- ==============================================================================
-- 13. TRIGGER: Auto-create customer profile on signup
-- ==============================================================================
create or replace function public.handle_new_customer_signup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customer_profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, customer_profiles.full_name),
    phone = coalesce(excluded.phone, customer_profiles.phone),
    updated_at = now();
  return new;
end; $$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_signup();

-- ==============================================================================
-- 14. TRIGGER: Auto-update product rating aggregates
-- ==============================================================================
create or replace function public.update_product_rating_aggregates()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);
  update public.products set
    rating = coalesce((select round(avg(rating)::numeric, 2) from public.product_reviews
      where product_id = target_product_id and is_approved = true), 0),
    review_count = coalesce((select count(*)::integer from public.product_reviews
      where product_id = target_product_id and is_approved = true), 0),
    updated_at = now()
  where id = target_product_id;
  return null;
end; $$;

drop trigger if exists on_review_aggregate_change on product_reviews;
create trigger on_review_aggregate_change
  after insert or update or delete on product_reviews
  for each row execute function public.update_product_rating_aggregates();

-- ==============================================================================
-- 15. FUNCTION: reserve_stock
-- ==============================================================================
create or replace function reserve_stock(p_product_id uuid, p_quantity integer)
returns boolean language plpgsql set search_path = public as $$
declare v_updated integer;
begin
  if p_quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if;
  update products set stock_quantity = stock_quantity - p_quantity
  where id = p_product_id and stock_quantity >= p_quantity;
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end; $$;

-- ==============================================================================
-- 16. FUNCTION: release_stock
-- ==============================================================================
create or replace function release_stock(p_product_id uuid, p_quantity integer)
returns void language plpgsql set search_path = public as $$
begin
  if p_quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if;
  update products set stock_quantity = stock_quantity + p_quantity where id = p_product_id;
  if not found then raise exception 'Product % does not exist', p_product_id; end if;
end; $$;

-- ==============================================================================
-- 17. FUNCTION: create_pending_order (atomic checkout)
-- ==============================================================================
create or replace function create_pending_order(p_order jsonb, p_items jsonb)
returns uuid language plpgsql set search_path = public as $$
declare
  v_order_id uuid; v_item jsonb; v_reserved boolean; v_currency text;
begin
  v_currency := coalesce(p_order->>'currency', 'INR');
  insert into orders (
    order_number, tracking_token, customer_id,
    customer_name, customer_email, customer_phone, shipping_address,
    subtotal_amount, taxable_amount, shipping_amount,
    tax_amount, cgst_amount, sgst_amount, igst_amount,
    total_amount, currency, status
  ) values (
    p_order->>'order_number', p_order->>'tracking_token',
    nullif(p_order->>'customer_id', '')::uuid,
    p_order->>'customer_name', p_order->>'customer_email', p_order->>'customer_phone',
    p_order->'shipping_address',
    (p_order->>'subtotal_amount')::numeric, (p_order->>'taxable_amount')::numeric,
    (p_order->>'shipping_amount')::numeric, (p_order->>'tax_amount')::numeric,
    (p_order->>'cgst_amount')::numeric, (p_order->>'sgst_amount')::numeric,
    (p_order->>'igst_amount')::numeric, (p_order->>'total_amount')::numeric,
    v_currency, 'pending_payment'
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_reserved := reserve_stock((v_item->>'product_id')::uuid, (v_item->>'quantity')::integer);
    if not v_reserved then
      raise exception 'INSUFFICIENT_STOCK:%', v_item->>'product_id';
    end if;
    insert into order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, gst_rate, tax_amount)
    values (v_order_id, (v_item->>'product_id')::uuid, v_item->>'product_name',
      (v_item->>'unit_price')::numeric, (v_item->>'quantity')::integer,
      (v_item->>'subtotal')::numeric, (v_item->>'gst_rate')::numeric, (v_item->>'tax_amount')::numeric);
    insert into inventory_movements (product_id, quantity, movement_type, reference_id, note)
    values ((v_item->>'product_id')::uuid, -(v_item->>'quantity')::integer,
      'order', v_order_id, 'Stock reserved for pending payment');
  end loop;
  return v_order_id;
end; $$;

-- ==============================================================================
-- 18. FUNCTION: rollback_pending_order
-- ==============================================================================
create or replace function rollback_pending_order(p_order_id uuid)
returns boolean language plpgsql set search_path = public as $$
declare v_status text; v_item record;
begin
  select status into v_status from orders where id = p_order_id for update;
  if not found or v_status <> 'pending_payment' then return false; end if;
  for v_item in select product_id, quantity from order_items
    where order_id = p_order_id and product_id is not null
  loop perform release_stock(v_item.product_id, v_item.quantity); end loop;
  delete from inventory_movements where reference_id = p_order_id;
  delete from orders where id = p_order_id;
  return true;
end; $$;

-- ==============================================================================
-- 19. FUNCTION: release_stale_pending_orders
-- ==============================================================================
create or replace function release_stale_pending_orders(p_older_than_minutes integer default 30)
returns integer language plpgsql set search_path = public as $$
declare v_order record; v_count integer := 0; v_item record;
begin
  if p_older_than_minutes <= 0 then raise exception 'p_older_than_minutes must be greater than zero'; end if;
  for v_order in
    select id from orders
    where status = 'pending_payment' and created_at < now() - make_interval(mins => p_older_than_minutes)
    for update skip locked
  loop
    if exists (select 1 from orders where id = v_order.id and status = 'pending_payment') then
      for v_item in select product_id, quantity from order_items
        where order_id = v_order.id and product_id is not null
      loop
        perform release_stock(v_item.product_id, v_item.quantity);
        insert into inventory_movements (product_id, quantity, movement_type, reference_id, note)
        values (v_item.product_id, v_item.quantity, 'cancellation', v_order.id, 'Auto-released: payment abandoned');
      end loop;
      update orders set status = 'cancelled' where id = v_order.id and status = 'pending_payment';
      if found then v_count := v_count + 1; end if;
    end if;
  end loop;
  return v_count;
end; $$;

-- ==============================================================================
-- 20. FUNCTION: increment_site_metric
-- ==============================================================================
create or replace function public.increment_site_metric(metric_id text, increment_by int default 1)
returns bigint language plpgsql security definer set search_path = public as $$
declare new_count bigint;
begin
  insert into public.site_metrics (id, count, updated_at)
  values (metric_id, increment_by, now())
  on conflict (id) do update
  set count = site_metrics.count + increment_by, updated_at = now()
  returning count into new_count;
  return new_count;
end; $$;

-- ==============================================================================
-- 21. ROW LEVEL SECURITY
-- ==============================================================================
alter table products enable row level security;
alter table product_images enable row level security;
alter table shipping_rates enable row level security;
alter table customer_profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inventory_movements enable row level security;
alter table cart_items enable row level security;
alter table contact_inquiries enable row level security;
alter table product_reviews enable row level security;
alter table site_metrics enable row level security;

-- Drop all existing policies (safe re-run)
drop policy if exists "Anyone can view active products" on products;
drop policy if exists "Public can view active products" on products;
drop policy if exists "Anyone can view product images" on product_images;
drop policy if exists "Public can view product images" on product_images;
drop policy if exists "Anyone can view active shipping rates" on shipping_rates;
drop policy if exists "Public can view active shipping rates" on shipping_rates;
drop policy if exists "Users can view own profile" on customer_profiles;
drop policy if exists "Users can update own profile" on customer_profiles;
drop policy if exists "Users can insert own profile" on customer_profiles;
drop policy if exists "Users can view own cart" on cart_items;
drop policy if exists "Users can insert own cart" on cart_items;
drop policy if exists "Users can update own cart" on cart_items;
drop policy if exists "Users can delete own cart" on cart_items;
drop policy if exists "Anyone can view approved reviews" on product_reviews;
drop policy if exists "Users can submit reviews" on product_reviews;
drop policy if exists "Anyone can submit contact inquiry" on contact_inquiries;
drop policy if exists "Public can create contact inquiries" on contact_inquiries;
drop policy if exists "Allow public read site_metrics" on site_metrics;

-- Recreate policies
create policy "Anyone can view active products" on products for select using (is_active = true);
create policy "Anyone can view product images" on product_images for select using (true);
create policy "Anyone can view active shipping rates" on shipping_rates for select using (is_active = true);
create policy "Users can view own profile" on customer_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on customer_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on customer_profiles for insert with check (auth.uid() = id);
create policy "Users can view own cart" on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart" on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart" on cart_items for delete using (auth.uid() = user_id);
create policy "Anyone can view approved reviews" on product_reviews for select using (is_approved = true);
create policy "Users can submit reviews" on product_reviews for insert with check (true);
create policy "Anyone can submit contact inquiry" on contact_inquiries for insert with check (true);
create policy "Allow public read site_metrics" on site_metrics for select to anon, authenticated using (true);

-- Restrict sensitive tables to service_role only
revoke all on table orders from anon, authenticated;
revoke all on table order_items from anon, authenticated;
revoke all on table inventory_movements from anon, authenticated;
grant all on table orders to service_role;
grant all on table order_items to service_role;
grant all on table inventory_movements to service_role;

-- Function permissions
revoke execute on function reserve_stock(uuid, integer) from anon, authenticated;
revoke execute on function release_stock(uuid, integer) from anon, authenticated;
revoke execute on function create_pending_order(jsonb, jsonb) from anon, authenticated;
revoke execute on function rollback_pending_order(uuid) from anon, authenticated;
revoke execute on function release_stale_pending_orders(integer) from anon, authenticated;
grant execute on function reserve_stock(uuid, integer) to service_role;
grant execute on function release_stock(uuid, integer) to service_role;
grant execute on function create_pending_order(jsonb, jsonb) to service_role;
grant execute on function rollback_pending_order(uuid) to service_role;
grant execute on function release_stale_pending_orders(integer) to service_role;
grant execute on function public.increment_site_metric(text, int) to anon, authenticated, service_role;

-- ==============================================================================
-- 22. SEED DATA: Shipping rates
-- ==============================================================================
truncate table shipping_rates;
insert into shipping_rates (name, state, district, pincode_prefix, min_order_amount, shipping_amount, is_active)
values
  ('Free Shipping (Orders above Rs.645)', null, null, null, 645.00, 0.00, true),
  ('Free Local Delivery (Paradeep)', 'Odisha', 'Paradeep', '754142', 0.00, 0.00, true),
  ('Free Local Delivery (Paradip)', 'Odisha', 'Paradip', null, 0.00, 0.00, true),
  ('Odisha District Delivery (Cuttack)', 'Odisha', 'Cuttack', null, 0.00, 59.00, true),
  ('Odisha District Delivery (Khordha)', 'Odisha', 'Khordha', null, 0.00, 59.00, true),
  ('Odisha District Delivery (Khurda)', 'Odisha', 'Khurda', null, 0.00, 59.00, true),
  ('Odisha District Delivery (Bhubaneswar)', 'Odisha', 'Bhubaneswar', null, 0.00, 59.00, true),
  ('Odisha District Delivery (Dhenkanal)', 'Odisha', 'Dhenkanal', null, 0.00, 59.00, true),
  ('Odisha District Delivery (Jagatsinghpur)', 'Odisha', 'Jagatsinghpur', null, 0.00, 59.00, true),
  ('Rest of India Standard Shipping (Rs.80)', null, null, null, 0.00, 80.00, true);

-- ==============================================================================
-- 23. SEED DATA: Products (Turmeric Powder only)
-- ==============================================================================
-- Deactivate all other products and ensure gst_rate is 0
update products set is_active = false
where slug <> 'kandhamal-turmeric-powder';

update products set gst_rate = 0.00;

insert into products (id, name, slug, sku, short_description, description, category, price, currency, unit, weight_grams, gst_rate, image_url, stock_quantity, is_active)
values
(
  'cd096cd8-1104-41c5-9539-46a87b5b96c1',
  'Farmsmith Turmeric Powder','kandhamal-turmeric-powder','FS-TURMERIC-001',
  'Pure GI-tagged Kandhamal turmeric powder with high curcumin content and batch test reports.',
  'Sourced directly from Kandhamal organic farming clusters in Odisha. 100% pure, unadulterated, and rich in natural curcumin.',
  'Other spices whole and powder',129.00,'INR','100g',100,0.00,'/images/Product 1.PNG',92,true
)
on conflict (slug) do update set
  id = excluded.id, name = excluded.name, category = excluded.category,
  price = excluded.price, unit = excluded.unit, weight_grams = excluded.weight_grams,
  gst_rate = 0.00,
  short_description = excluded.short_description, stock_quantity = excluded.stock_quantity,
  is_active = true, updated_at = now();

-- ==============================================================================
-- 24. SEED DATA: Site metrics
-- ==============================================================================
insert into site_metrics (id, count)
values ('batch_verifications', 0)
on conflict (id) do nothing;

-- ==============================================================================
-- DONE - All tables, functions, policies, indexes, and seed data are set up.
-- ==============================================================================
