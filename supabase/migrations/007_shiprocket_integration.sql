-- ============================================================
-- FarmSmith Foods - Shiprocket Fulfillment Schema (Migration 007)
-- Adds Shiprocket tracking columns, status tracking, and indexes.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text,
  ADD COLUMN IF NOT EXISTS awb_code text,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending', 'creating', 'created', 'failed')),
  ADD COLUMN IF NOT EXISTS shiprocket_error text;

-- Unique constraint on shiprocket_order_id (when non-null) to enforce DB-level uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id_unique
  ON public.orders (shiprocket_order_id)
  WHERE shiprocket_order_id IS NOT NULL;

-- Index for fast AWB tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_awb_code
  ON public.orders (awb_code)
  WHERE awb_code IS NOT NULL;

-- Index for background fulfillment retries
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_retry
  ON public.orders (status, fulfillment_status)
  WHERE status = 'paid' AND fulfillment_status = 'failed';
