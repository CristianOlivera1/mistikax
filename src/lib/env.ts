import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  CART_COOKIE_SECRET: z.string().min(32).optional(),
  UPLOAD_DIR: z.string().min(1).default("./storage/uploads"),
});

export const serverEnv = serverEnvSchema.parse(process.env);
