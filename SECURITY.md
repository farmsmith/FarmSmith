# FarmSmith Security Model

## Key principle: the browser is never trusted with anything sensitive

Next.js compiles a strict server/client split. Anything in a Client
Component ships to the browser and is fully inspectable. Anything in a
Route Handler, Server Component, or a file marked `import "server-only"`
never leaves the server — not obfuscated, genuinely absent from the
browser bundle. This is enforced at build time, not by folder naming.

## Secrets — where each one lives

| Secret | Lives in | Never appears in |
|---|---|---|
| `SUPABASE_SECRET_KEY` | Route Handlers only, via `lib/supabase/admin.ts` | Browser bundle, git |
| `RAZORPAY_KEY_SECRET` | Route Handlers only, via `lib/razorpay/*.ts` | Browser bundle, git |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Route Handler only | Browser bundle, git |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anywhere (safe) | — |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Anywhere (safe) | — |

Every server-only file starts with `import "server-only"` — importing it
from a Client Component is a **build error**, not a silent leak.

## Database access model

- **RLS is enabled on every table.**
- `products`: `anon` role can `SELECT` only rows where `is_active = true`.
  No insert/update/delete policy exists for `anon` at all.
- `orders`, `order_items`, `inventory_movements`: **no RLS policy AND
  explicit `REVOKE ALL ... FROM anon, authenticated`.** Two independent
  layers (grants + RLS) both deny access — only the secret key (which
  bypasses RLS) can touch these tables, and only from a Route Handler.

## The checkout trust boundary

The browser sends *intent* (which product IDs, what quantities, customer
info) — never price, total, or stock. `/api/checkout`:

1. Validates the request shape with Zod
2. Rate-limits by IP
3. Looks up each product's real price/stock from the database
4. Rejects if inactive or insufficient stock
5. Calculates the total itself — the client's numbers are never read
6. Atomically decrements stock via the `decrement_stock` Postgres
   function (prevents two simultaneous buyers oversubscribing the last
   unit), rolling back on any failure
7. Creates the order (`pending_payment`), then the Razorpay order

## Payment confirmation

**The Razorpay webhook — not the browser's post-payment callback — is
the only thing that marks an order `paid`.** The webhook handler
verifies Razorpay's HMAC signature (constant-time comparison) before
trusting the payload at all. A user closing their browser mid-payment,
or a malicious client faking a "success" response, cannot mark an order
paid.

## Order tracking

Order status requires **both** `order_number` (sequential, semi-guessable
— e.g. `FS-2026-4F9A2C`) **and** `tracking_token` (256-bit random value,
generated server-side, never guessable). Knowing the order number alone
reveals nothing. The tracking link (containing the token) should be sent
via email/WhatsApp, not exposed in ordinary navigation.

## What's intentionally NOT built

- No admin dashboard — products are added directly via the Supabase
  Table Editor or SQL, since only the developer adds products.
- No customer accounts/auth yet — orders are tracked via the
  order-number + token pair instead. Can be added later without
  restructuring the schema.
