import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  CART_COOKIE_SECRET: z.string().min(32).optional(),
  UPLOAD_DIR: z.string().min(1).default("./storage/uploads"),
});

export const serverEnv = serverEnvSchema.parse(process.env);
