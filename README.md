# FarmSmith Foods — E-commerce

Foundation built: Next.js 16 (App Router) + TypeScript + Tailwind 4 +
Supabase + Razorpay, following the security model in `SECURITY.md`.

## What's here

- ✅ Next.js 16 App Router + TypeScript + Tailwind 4
- ✅ Supabase schema + ecommerce feature migration
- ✅ Product model + product gallery
- ✅ Server-side shipping calculation
- ✅ Server-side GST calculation (CGST/SGST or IGST)
- ✅ Customer accounts backed by Supabase Auth
- ✅ Customer profile and order-history APIs
- ✅ Secure checkout + Razorpay integration
- ✅ Transactional stock reservation and rollback
- ✅ Order tracking
- ✅ Razorpay webhook payment confirmation

## Frontend still to build

- Storefront UI: shop grid, product detail, cart, checkout pages
- Supabase Auth UI: sign up, login, logout, reset password
- Wiring the Razorpay checkout widget
- My Account: profile, orders, order details
- Order confirmation / tracking pages

## Setup

1. **Run the SQL migrations** in order — first
   `supabase/migrations/001_initial_schema.sql`, then
   `supabase/migrations/002_ecommerce_features.sql` in your Supabase
   project's SQL Editor.

2. **Environment variables** — copy `.env.example` to `.env.local` and
   fill in real values from:
   - Supabase → Settings → API Keys (Project URL + Publishable key +
     Secret key)
   - Razorpay Dashboard → Settings → API Keys (Key ID + Key Secret)
   - Razorpay Dashboard → Webhooks (Webhook Secret, once you set up the
     webhook URL — see below)

   Never commit `.env.local` — it's already gitignored.

3. **Install & run locally:**
   ```bash
   npm install
   npm run dev
   ```

4. **Stale pending-payment cleanup** — after deployment, schedule
   `select release_stale_pending_orders(30);` every 5–10 minutes using
   Supabase pg_cron or another trusted scheduler. The SQL function uses row
   locks so concurrent workers cannot release the same order twice. A valid
   Razorpay capture that arrives after expiry is retained as
   `payment_captured_after_expiry` for reconciliation rather than being
   silently discarded.

5. **Razorpay webhook setup** (once deployed):
   - Razorpay Dashboard → Settings → Webhooks → Add New Webhook
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Copy the generated webhook secret into `RAZORPAY_WEBHOOK_SECRET`

6. **Deploy on Vercel** — note: Vercel's free Hobby plan is for
   non-commercial use only. Since FarmSmith is a commercial store, use
   the Pro plan (~$20/month). Add all `.env.local` values as Environment
   Variables in the Vercel project settings.

## Backend hardening notes

- Checkout database work is performed by the `create_pending_order()`
  PostgreSQL function so stock reservation, order creation, order items, and
  inventory movements commit or roll back together.
- `rollback_pending_order()` safely compensates when Razorpay order creation
  or local payment mapping fails.
- Razorpay orders include the internal FarmSmith order ID in server-side
  Razorpay notes, allowing the webhook to close the tiny mapping race before
  `razorpay_order_id` is persisted.
- Duplicate product IDs are rejected at checkout.
- Late payment captures are never silently ignored.

## Adding products (no admin panel by design)

Use the Supabase Table Editor (Table Editor → products → Insert row), or
run SQL directly in the SQL Editor, e.g.:

```sql
insert into products (name, slug, description, price, image_url, stock_quantity)
values (
  'GI-Tagged Turmeric Powder — 250g',
  'gi-tagged-turmeric-250g',
  'Batch-tested, GI-tagged turmeric grown with full traceability.',
  349.00,
  '/images/product_turmeric.png',
  50
);
```

See `SECURITY.md` for the full security model this project follows.
