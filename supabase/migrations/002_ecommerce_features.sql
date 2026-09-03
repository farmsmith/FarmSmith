-- ============================================================
-- FarmSmith Foods - Ecommerce feature expansion
-- 1. Product model
-- 2. Product gallery
-- 3. Shipping
-- 4. GST / tax
-- 5. Customer accounts
-- 6. Checkout/order financial snapshot
-- ============================================================

alter table products
  add column if not exists sku text,
  add column if not exists short_description text,
  add column if not exists category text,
  add column if not exists unit text,
  add column if not exists weight_grams integer,
  add column if not exists gst_rate numeric(5,2) not null default 0
    check (gst_rate >= 0 and gst_rate <= 100);

create unique index if not exists idx_products_sku_unique
  on products(sku)
  where sku is not null;

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_sort
  on product_images(product_id, sort_order);

create unique index if not exists idx_product_images_one_primary
  on product_images(product_id)
  where is_primary = true;

create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  pincode_prefix text,
  min_order_amount numeric(10,2) not null default 0
    check (min_order_amount >= 0),
  shipping_amount numeric(10,2) not null
    check (shipping_amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shipping_rates_lookup
  on shipping_rates(is_active, state, pincode_prefix, min_order_amount desc);

alter table orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null,
  add column if not exists subtotal_amount numeric(10,2) not null default 0
    check (subtotal_amount >= 0),
  add column if not exists taxable_amount numeric(10,2) not null default 0
    check (taxable_amount >= 0),
  add column if not exists shipping_amount numeric(10,2) not null default 0
    check (shipping_amount >= 0),
  add column if not exists tax_amount numeric(10,2) not null default 0
    check (tax_amount >= 0),
  add column if not exists cgst_amount numeric(10,2) not null default 0
    check (cgst_amount >= 0),
  add column if not exists sgst_amount numeric(10,2) not null default 0
    check (sgst_amount >= 0),
  add column if not exists igst_amount numeric(10,2) not null default 0
    check (igst_amount >= 0);

create index if not exists idx_orders_customer_created
  on orders(customer_id, created_at desc);

alter table order_items
  add column if not exists gst_rate numeric(5,2) not null default 0
    check (gst_rate >= 0 and gst_rate <= 100),
  add column if not exists tax_amount numeric(10,2) not null default 0
    check (tax_amount >= 0);

create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep customer profile timestamps in sync.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_customer_profiles_updated_at') then
    create trigger trg_customer_profiles_updated_at
      before update on customer_profiles
      for each row execute function set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_shipping_rates_updated_at') then
    create trigger trg_shipping_rates_updated_at
      before update on shipping_rates
      for each row execute function set_updated_at();
  end if;
end;
$$;

-- Public product gallery reads are safe; writes stay server-only.
alter table product_images enable row level security;
alter table shipping_rates enable row level security;
alter table customer_profiles enable row level security;

drop policy if exists "Public can view product images" on product_images;
create policy "Public can view product images"
  on product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and products.is_active = true
    )
  );

drop policy if exists "Public can view active shipping rates" on shipping_rates;
create policy "Public can view active shipping rates"
  on shipping_rates
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Users can view own profile" on customer_profiles;
create policy "Users can view own profile"
  on customer_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on customer_profiles;
create policy "Users can insert own profile"
  on customer_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on customer_profiles;
create policy "Users can update own profile"
  on customer_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Replace the original checkout RPC with the expanded financial snapshot.
create or replace function create_pending_order(
  p_order jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_reserved boolean;
  v_currency text;
begin
  v_currency := coalesce(p_order->>'currency', 'INR');

  insert into orders (
    order_number,
    tracking_token,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    subtotal_amount,
    taxable_amount,
    shipping_amount,
    tax_amount,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
    currency,
    status
  ) values (
    p_order->>'order_number',
    p_order->>'tracking_token',
    nullif(p_order->>'customer_id', '')::uuid,
    p_order->>'customer_name',
    p_order->>'customer_email',
    p_order->>'customer_phone',
    p_order->'shipping_address',
    (p_order->>'subtotal_amount')::numeric,
    (p_order->>'taxable_amount')::numeric,
    (p_order->>'shipping_amount')::numeric,
    (p_order->>'tax_amount')::numeric,
    (p_order->>'cgst_amount')::numeric,
    (p_order->>'sgst_amount')::numeric,
    (p_order->>'igst_amount')::numeric,
    (p_order->>'total_amount')::numeric,
    v_currency,
    'pending_payment'
  )
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_reserved := reserve_stock(
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer
    );

    if not v_reserved then
      raise exception 'INSUFFICIENT_STOCK:%', v_item->>'product_id';
    end if;

    insert into order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      subtotal,
      gst_rate,
      tax_amount
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'subtotal')::numeric,
      (v_item->>'gst_rate')::numeric,
      (v_item->>'tax_amount')::numeric
    );

    insert into inventory_movements (
      product_id,
      quantity,
      movement_type,
      reference_id,
      note
    ) values (
      (v_item->>'product_id')::uuid,
      -(v_item->>'quantity')::integer,
      'order',
      v_order_id,
      'Stock reserved for pending payment'
    );
  end loop;

  return v_order_id;
end;
$$;

revoke execute on function create_pending_order(jsonb, jsonb) from anon, authenticated;

-- Recommended starter shipping rules (Standard non-zero rates only).
insert into shipping_rates (name, state, min_order_amount, shipping_amount, is_active)
select 'Tamil Nadu Standard', 'Tamil Nadu', 0, 60, true
where not exists (
  select 1 from shipping_rates where name = 'Tamil Nadu Standard'
);

insert into shipping_rates (name, state, min_order_amount, shipping_amount, is_active)
select 'Other States Standard', null, 0, 100, true
where not exists (
  select 1 from shipping_rates where name = 'Other States Standard'
);
