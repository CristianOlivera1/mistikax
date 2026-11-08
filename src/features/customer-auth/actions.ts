"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-url";
import {
  customerSignInSchema,
  customerSignUpSchema,
  type CustomerSignInValues,
  type CustomerSignUpValues,
} from "./schema";

export type CustomerAuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; message: string };

export type CustomerOAuthResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function signInCustomerAction(
  values: CustomerSignInValues,
): Promise<CustomerAuthResult> {
  const parsed = customerSignInSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa tus datos.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  return { ok: true };
}

export async function signUpCustomerAction(
  values: CustomerSignUpValues,
): Promise<CustomerAuthResult> {
  const parsed = customerSignUpSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revisa tus datos.",
    };
  }

  const origin = await getSiteOrigin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    return {
      ok: false,
      message: "No se pudo crear la cuenta. Revisa el correo e inténtalo de nuevo.",
    };
  }

  if (!data.session) {
    return { ok: true, needsConfirmation: true };
  }

  return { ok: true };
}

export async function signInWithGoogleAction(): Promise<CustomerOAuthResult> {
  const origin = await getSiteOrigin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/account`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    return {
      ok: false,
      message: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
    };
  }

  return { ok: true, url: data.url };
}

export async function signOutCustomerAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
