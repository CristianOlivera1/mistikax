import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: text("path").notNull().unique(),
  objectKey: text("object_key").notNull(),
  mime: text("mime").notNull(),
  bytes: integer("bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  checksum: text("checksum").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
