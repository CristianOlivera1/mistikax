import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

if (!serverEnv.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to use the database client.");
}

export const client = postgres(serverEnv.DATABASE_URL, {
  idle_timeout: 60,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
  prepare: false,
  max: 10,
});

export const db = drizzle(client, { schema });
