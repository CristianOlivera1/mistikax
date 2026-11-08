"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, type LoginValues } from "./schema";

export type LoginResult = { ok: true } | { ok: false; message: string };

export async function signInAction(values: LoginValues): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Revisa el correo y la contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  const [profile] = await db
    .select({ role: profiles.role, active: profiles.active })
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1);

  if (!profile || !profile.active || profile.role === "customer") {
    await supabase.auth.signOut();
    return { ok: false, message: "Esta cuenta no tiene acceso al panel." };
  }

  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
