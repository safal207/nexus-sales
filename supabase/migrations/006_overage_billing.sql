-- Migration: Overage Billing Enhancements
-- Description: Adds invoicing metadata for API usage overage handling

ALTER TABLE eco_usage_records
    ADD COLUMN IF NOT EXISTS overage_invoiced BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stripe_invoice_item_id TEXT;

CREATE INDEX IF NOT EXISTS idx_usage_overage_pending
    ON eco_usage_records (eco_id)
    WHERE overage_invoiced = FALSE;

COMMENT ON COLUMN eco_usage_records.overage_invoiced IS 'Whether the overage charge has been invoiced in Stripe';
COMMENT ON COLUMN eco_usage_records.stripe_invoice_item_id IS 'Stripe invoice item id for the recorded overage charge';
