import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const mediaSource = pgEnum("media_source", ["catalog", "upload"]);

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: text("path").notNull().unique(),
  objectKey: text("object_key").notNull(),
  source: mediaSource("source").notNull(),
  mime: text("mime").notNull(),
  bytes: integer("bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  checksum: text("checksum").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
