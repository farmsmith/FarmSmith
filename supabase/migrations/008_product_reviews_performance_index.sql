-- ============================================================
-- FarmSmith Foods - Product Reviews Performance Index (Phase 2B)
-- Optimizes approved product review queries filtered by product_name
-- and ordered by created_at DESC for product detail pages and public reviews.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_product_reviews_approved_product_created
  ON public.product_reviews (product_name, created_at DESC)
  WHERE is_approved = true;
