"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
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
