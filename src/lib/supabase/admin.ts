import "server-only";

import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import { publicEnv } from "@/lib/public-env";

if (!serverEnv.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is required for the admin client.");
}

export const supabaseAdmin = createClient(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
