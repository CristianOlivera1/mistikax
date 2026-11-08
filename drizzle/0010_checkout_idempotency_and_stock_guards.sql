ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotency_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_idempotency_key_unique" ON "orders" ("idempotency_key");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_stock" ADD CONSTRAINT "product_stock_quantity_nonnegative" CHECK ("quantity" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "coupons" ADD CONSTRAINT "coupons_counts_nonnegative" CHECK ("uses" >= 0 AND "max_uses" >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
