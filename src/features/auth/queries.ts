import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { profiles, type ProfileRole } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  id: string;
  email: string;
  fullName: string;
  role: ProfileRole;
};

export const getAdminSession = cache(
  async (): Promise<AdminSession | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!profile || !profile.active) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: profile.fullName || user.email,
      role: profile.role,
    };
  },
);
