import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const pageStatus = pgEnum("page_status", ["published", "draft"]);

export const pages = pgTable("pages", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  status: pageStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const homeContent = pgTable("home_content", {
  id: integer("id").primaryKey(),
  announcementEnabled: boolean("announcement_enabled").notNull().default(true),
  announcementText: text("announcement_text").notNull().default(""),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull().default(""),
  heroCta: text("hero_cta").notNull(),
  heroLink: text("hero_link").notNull(),
  heroImage: text("hero_image").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const homeSections = pgTable("home_sections", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  storeName: text("store_name").notNull(),
  description: text("description").notNull().default(""),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  address: text("address").notNull().default(""),
  currency: text("currency").notNull().default("PEN"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  shippingCents: integer("shipping_cents").notNull().default(0),
  shippingLimaCents: integer("shipping_lima_cents").notNull().default(1000),
  shippingLimaOuterCents: integer("shipping_lima_outer_cents")
    .notNull()
    .default(1500),
  shippingProvincesCents: integer("shipping_provinces_cents")
    .notNull()
    .default(2000),
  pickupEnabled: boolean("pickup_enabled").notNull().default(true),
  deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
  courierEnabled: boolean("courier_enabled").notNull().default(true),
  freeShippingThresholdCents: integer("free_shipping_threshold_cents")
    .notNull()
    .default(0),
  leadTime: text("lead_time").notNull().default(""),
  paymentCard: boolean("payment_card").notNull().default(true),
  paymentTransfer: boolean("payment_transfer").notNull().default(true),
  paymentCod: boolean("payment_cod").notNull().default(true),
  paymentWallet: boolean("payment_wallet").notNull().default(false),
  transferInstructions: text("transfer_instructions").notNull().default(""),
  primaryColor: text("primary_color").notNull().default("#D4C5B9"),
  accentColor: text("accent_color").notNull().default("#857262"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
