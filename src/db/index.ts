import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

if (!serverEnv.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to use the database client.");
}

const globalForDb = globalThis as typeof globalThis & {
  mistikaxSql?: ReturnType<typeof postgres>;
};

export const client =
  globalForDb.mistikaxSql ??
  postgres(serverEnv.DATABASE_URL, {
    idle_timeout: 60,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
    prepare: false,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.mistikaxSql = client;
}

export const db = drizzle(client, { schema });
