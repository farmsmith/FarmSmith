-- FarmSmith Foods — initial schema
-- Run this once in the new Supabase project's SQL Editor.

create extension if not exists "pgcrypto";

-- ============================================
-- PRODUCTS
-- ============================================
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  currency text not null default 'INR',
  image_url text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ORDERS
-- ============================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  tracking_token text not null unique,

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,

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

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

-- ============================================
-- INVENTORY MOVEMENTS
-- ============================================
create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null,
  movement_type text not null
    check (movement_type in (
      'initial_stock',
      'restock',
      'order',
      'cancellation',
      'refund',
      'adjustment'
    )),
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);

-- ============================================
-- updated_at trigger
-- ============================================
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================
-- Atomic stock reservation
-- ============================================
create or replace function reserve_stock(p_product_id uuid, p_quantity integer)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_updated integer;
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  update products
  set stock_quantity = stock_quantity - p_quantity
  where id = p_product_id
    and stock_quantity >= p_quantity;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

-- ============================================
-- Explicit stock release
-- ============================================
create or replace function release_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  update products
  set stock_quantity = stock_quantity + p_quantity
  where id = p_product_id;

  if not found then
    raise exception 'Product % does not exist', p_product_id;
  end if;
end;
$$;

-- ============================================
-- Atomic order creation + stock reservation
--
-- All database work for a checkout attempt happens inside one
-- PostgreSQL transaction. If any insert/reservation fails, PostgreSQL
-- rolls the entire function call back automatically.
-- ============================================
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
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_amount,
    currency,
    status
  ) values (
    p_order->>'order_number',
    p_order->>'tracking_token',
    p_order->>'customer_name',
    p_order->>'customer_email',
    p_order->>'customer_phone',
    p_order->'shipping_address',
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
      subtotal
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'subtotal')::numeric
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

-- ============================================
-- Atomic rollback of a pending order
--
-- Only pending_payment orders can be rolled back. The row lock prevents
-- a webhook or stale-order worker from changing the same order halfway
-- through the rollback.
-- ============================================
create or replace function rollback_pending_order(p_order_id uuid)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_status text;
  v_item record;
begin
  select status
  into v_status
  from orders
  where id = p_order_id
  for update;

  if not found or v_status <> 'pending_payment' then
    return false;
  end if;

  for v_item in
    select product_id, quantity
    from order_items
    where order_id = p_order_id
      and product_id is not null
  loop
    perform release_stock(v_item.product_id, v_item.quantity);
  end loop;

  -- The reservation never became a completed order, so remove its audit
  -- records together with the temporary order.
  delete from inventory_movements where reference_id = p_order_id;
  delete from orders where id = p_order_id;

  return true;
end;
$$;

-- ============================================
-- Release stale pending orders safely
--
-- FOR UPDATE SKIP LOCKED makes concurrent scheduler executions safe:
-- each order can be claimed by only one worker.
-- ============================================
create or replace function release_stale_pending_orders(
  p_older_than_minutes integer default 30
)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_order record;
  v_count integer := 0;
  v_item record;
begin
  if p_older_than_minutes <= 0 then
    raise exception 'p_older_than_minutes must be greater than zero';
  end if;

  for v_order in
    select id
    from orders
    where status = 'pending_payment'
      and created_at < now() - make_interval(mins => p_older_than_minutes)
    for update skip locked
  loop
    -- Re-check the status while holding the row lock.
    if exists (
      select 1 from orders
      where id = v_order.id
        and status = 'pending_payment'
    ) then
      for v_item in
        select product_id, quantity
        from order_items
        where order_id = v_order.id
          and product_id is not null
      loop
        perform release_stock(v_item.product_id, v_item.quantity);

        insert into inventory_movements (
          product_id,
          quantity,
          movement_type,
          reference_id,
          note
        ) values (
          v_item.product_id,
          v_item.quantity,
          'cancellation',
          v_order.id,
          'Auto-released: payment abandoned'
        );
      end loop;

      update orders
      set status = 'cancelled'
      where id = v_order.id
        and status = 'pending_payment';

      if found then
        v_count := v_count + 1;
      end if;
    end if;
  end loop;

  return v_count;
end;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inventory_movements enable row level security;

create policy "Public can view active products"
  on products
  for select
  to anon
  using (is_active = true);

revoke all on table orders from anon, authenticated;
revoke all on table order_items from anon, authenticated;
revoke all on table inventory_movements from anon, authenticated;

-- Prevent ordinary client roles from directly invoking privileged stock/order
-- mutation functions. The server uses the Supabase secret key instead.
revoke execute on function reserve_stock(uuid, integer) from anon, authenticated;
revoke execute on function release_stock(uuid, integer) from anon, authenticated;
revoke execute on function create_pending_order(jsonb, jsonb) from anon, authenticated;
revoke execute on function rollback_pending_order(uuid) from anon, authenticated;
revoke execute on function release_stale_pending_orders(integer) from anon, authenticated;

-- ============================================
-- Indexes
-- ============================================
create index idx_products_active on products(is_active) where is_active = true;
create index idx_orders_order_number on orders(order_number);
create index idx_orders_created_at on orders(created_at desc);
create index idx_orders_razorpay_order_id on orders(razorpay_order_id);
create index idx_order_items_order_id on order_items(order_id);
create index idx_inventory_product on inventory_movements(product_id);
