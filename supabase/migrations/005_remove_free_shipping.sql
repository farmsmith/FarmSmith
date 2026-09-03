-- Migration 005: Permanently remove all Free Shipping rates and rules from FarmSmith
-- Every delivery location requires a non-zero shipping fee.

DELETE FROM shipping_rates
WHERE shipping_amount <= 0
   OR name ILIKE '%free%';
