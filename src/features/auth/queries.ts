import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { AdminRole } from "@/lib/nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
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

    if (!profile || !profile.active || profile.role === "customer") {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: profile.fullName || user.email,
      role: profile.role,
    };
  },
);

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("NOT_AUTHENTICATED");
  return session;
}

export async function requireRole(
  ...allowed: AdminRole[]
): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (!allowed.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}
