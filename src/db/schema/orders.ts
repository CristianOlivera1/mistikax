import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./catalog";

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

export const orderPaymentMethod = pgEnum("payment_method", [
  "card",
  "transfer",
  "cod",
]);

export const couponKind = pgEnum("coupon_kind", ["percent", "fixed"]);

export const coupons = pgTable("coupons", {
  code: text("code").primaryKey(),
  kind: couponKind("kind").notNull(),
  value: integer("value").notNull(),
  uses: integer("uses").notNull().default(0),
  expiresAt: date("expires_at", { mode: "string" }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  number: integer("number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull().default(""),
  status: orderStatus("status").notNull().default("pending"),
  paymentMethod: orderPaymentMethod("payment_method").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  size: text("size").notNull(),
  colorName: text("color_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: integer("id")
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatus("status").notNull(),
  changedBy: text("changed_by").notNull().default("system"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
