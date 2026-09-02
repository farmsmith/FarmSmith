-- ============================================================
-- FarmSmith Foods - Performance & Infrastructure Indexes (P1)
-- 1. Index customer_email on orders for account history lookups
-- 2. Index shiprocket_order_id on orders for webhook updates
-- 3. Index awb_code on orders for tracking lookups
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_email_created
  ON public.orders (customer_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id
  ON public.orders (shiprocket_order_id)
  WHERE shiprocket_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_awb_code
  ON public.orders (awb_code)
  WHERE awb_code IS NOT NULL;
