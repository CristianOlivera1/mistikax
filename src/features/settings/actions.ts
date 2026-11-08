"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { profiles, siteSettings } from "@/db/schema";
import { getAdminSession } from "@/features/auth/queries";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  appearanceSettingsSchema,
  generalSettingsSchema,
  paymentSettingsSchema,
  shippingSettingsSchema,
  type AppearanceSettingsValues,
  type GeneralSettingsValues,
  type PaymentSettingsValues,
  type ShippingSettingsValues,
} from "./schema";

type SettingsActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

const rowId = eq(siteSettings.id, 1);

const teamMemberSchema = z.object({
  id: z.uuid(),
  role: z.enum(["admin", "editor"]),
  active: z.boolean(),
});

const BAN_FOREVER = "876000h";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos.";
}

function revalidateSettings() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateGeneralSettingsAction(
  rawValues: GeneralSettingsValues,
): Promise<SettingsActionResult> {
  const parsed = generalSettingsSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;

  try {
    const rows = await db
      .update(siteSettings)
      .set({
        storeName: data.storeName,
        description: data.description,
        email: data.contactEmail,
        whatsapp: data.whatsapp,
        address: data.address,
        lowStockThreshold: data.stockThreshold,
        updatedAt: new Date(),
      })
      .where(rowId)
      .returning({ id: siteSettings.id });

    if (rows.length === 0) {
      return { status: "error", message: "La configuración no está inicializada." };
    }
  } catch {
    return { status: "error", message: "No se pudo guardar la configuración." };
  }

  revalidateSettings();

  return { status: "success" };
}

export async function updateShippingSettingsAction(
  rawValues: ShippingSettingsValues,
): Promise<SettingsActionResult> {
  const parsed = shippingSettingsSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;

  try {
    const rows = await db
      .update(siteSettings)
      .set({
        shippingCents: Math.round(data.shippingCost * 100),
        freeShippingThresholdCents: Math.round(data.freeShippingFrom * 100),
        leadTime: data.leadTime,
        updatedAt: new Date(),
      })
      .where(rowId)
      .returning({ id: siteSettings.id });

    if (rows.length === 0) {
      return { status: "error", message: "La configuración no está inicializada." };
    }
  } catch {
    return { status: "error", message: "No se pudo guardar el envío." };
  }

  revalidateSettings();

  return { status: "success" };
}

export async function updatePaymentSettingsAction(
  rawValues: PaymentSettingsValues,
): Promise<SettingsActionResult> {
  const parsed = paymentSettingsSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;

  try {
    const rows = await db
      .update(siteSettings)
      .set({
        paymentCard: data.paymentCard,
        paymentTransfer: data.paymentTransfer,
        paymentCod: data.paymentCod,
        paymentWallet: data.paymentWallet,
        transferInstructions: data.transferInstructions,
        updatedAt: new Date(),
      })
      .where(rowId)
      .returning({ id: siteSettings.id });

    if (rows.length === 0) {
      return { status: "error", message: "La configuración no está inicializada." };
    }
  } catch {
    return { status: "error", message: "No se pudo guardar los pagos." };
  }

  revalidateSettings();

  return { status: "success" };
}

export async function updateAppearanceSettingsAction(
  rawValues: AppearanceSettingsValues,
): Promise<SettingsActionResult> {
  const parsed = appearanceSettingsSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;

  try {
    const rows = await db
      .update(siteSettings)
      .set({
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        updatedAt: new Date(),
      })
      .where(rowId)
      .returning({ id: siteSettings.id });

    if (rows.length === 0) {
      return { status: "error", message: "La configuración no está inicializada." };
    }
  } catch {
    return { status: "error", message: "No se pudo guardar la apariencia." };
  }

  revalidateSettings();

  return { status: "success" };
}

export async function updateTeamMemberAction(rawValues: {
  id: string;
  role: string;
  active: boolean;
}): Promise<SettingsActionResult> {
  const session = await getAdminSession();

  if (session?.role !== "admin") {
    return {
      status: "error",
      message: "Solo un administrador puede gestionar el equipo.",
    };
  }

  const parsed = teamMemberSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: "Miembro no válido." };
  }

  const { id, role, active } = parsed.data;

  if (id === session.id && (!active || role !== "admin")) {
    return {
      status: "error",
      message: "No puedes quitarte el acceso de administrador.",
    };
  }

  const [target] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  if (!target) {
    return { status: "error", message: "El miembro no existe." };
  }

  if (target.role === "admin" && target.active && (!active || role !== "admin")) {
    const [admins] = await db
      .select({ total: count() })
      .from(profiles)
      .where(and(eq(profiles.role, "admin"), eq(profiles.active, true)));

    if ((admins?.total ?? 0) <= 1) {
      return {
        status: "error",
        message: "Debe quedar al menos un administrador activo.",
      };
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : BAN_FOREVER,
  });

  if (error) {
    return {
      status: "error",
      message: "No se pudo actualizar el acceso del miembro.",
    };
  }

  try {
    await db
      .update(profiles)
      .set({ role, active, updatedAt: new Date() })
      .where(eq(profiles.id, id));
  } catch {
    await supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: target.active ? "none" : BAN_FOREVER,
    });

    return { status: "error", message: "No se pudo guardar el cambio." };
  }

  revalidateSettings();

  return { status: "success" };
}
