-- ============================================================
-- FarmSmith Foods - Performance & Scalability Indexes (Phase 4)
-- 1. Index customer_id on orders for authenticated account order queries
-- 2. Index razorpay_order_id on orders for payment verification & webhook lookups
-- 3. Index product_id on product_images for joined catalog queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_id_created
  ON public.orders (customer_id, created_at DESC)
  WHERE customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id
  ON public.orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON public.product_images (product_id, sort_order ASC);
