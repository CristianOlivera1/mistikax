"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, type LoginValues } from "./schema";

export type LoginResult = { ok: true } | { ok: false; message: string };

export async function signInAction(values: LoginValues): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Revisa el correo y la contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
