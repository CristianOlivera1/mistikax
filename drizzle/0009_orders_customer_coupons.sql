ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_cents" integer NOT NULL DEFAULT 0;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" ("customer_id");--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "max_uses" integer NOT NULL DEFAULT 0;
