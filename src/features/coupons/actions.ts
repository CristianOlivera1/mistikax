"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { couponFormSchema, type CouponFormValues } from "./schema";

type CouponActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

const couponCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(
    /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/,
    "Usa mayúsculas, números y guiones.",
  );

function databaseValue(values: CouponFormValues): {
  kind: CouponFormValues["kind"];
  value: number;
  expiresAt: string;
  active: boolean;
} {
  return {
    kind: values.kind,
    value:
      values.kind === "percent"
        ? Math.round(values.value)
        : Math.round(values.value * 100),
    expiresAt: values.expiresAt,
    active: values.active,
  };
}

function revalidateCoupons() {
  revalidatePath("/admin/coupons");
}

export async function createCouponAction(
  rawValues: CouponFormValues,
): Promise<CouponActionResult> {
  const parsed = couponFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const data = parsed.data;

  try {
    await db
      .insert(coupons)
      .values({ code: data.code, ...databaseValue(data), uses: 0 });
  } catch {
    return {
      status: "error",
      message: "No se pudo crear el descuento. ¿El código ya existe?",
    };
  }

  revalidateCoupons();

  return { status: "success" };
}

export async function updateCouponAction(
  rawCode: string,
  rawValues: CouponFormValues,
): Promise<CouponActionResult> {
  const parsedCode = couponCodeSchema.safeParse(rawCode);
  const parsed = couponFormSchema.safeParse(rawValues);

  if (!parsedCode.success || !parsed.success) {
    return {
      status: "error",
      message: parsed.error?.issues[0]?.message ?? "Descuento no válido.",
    };
  }

  try {
    const rows = await db
      .update(coupons)
      .set(databaseValue(parsed.data))
      .where(eq(coupons.code, parsedCode.data))
      .returning({ code: coupons.code });

    if (rows.length === 0) {
      return { status: "error", message: "El descuento no existe." };
    }
  } catch {
    return { status: "error", message: "No se pudo actualizar el descuento." };
  }

  revalidateCoupons();

  return { status: "success" };
}

export async function deleteCouponAction(
  rawCode: string,
): Promise<CouponActionResult> {
  const parsed = couponCodeSchema.safeParse(rawCode);

  if (!parsed.success) {
    return { status: "error", message: "Descuento no válido." };
  }

  try {
    await db.delete(coupons).where(eq(coupons.code, parsed.data));
  } catch {
    return { status: "error", message: "No se pudo eliminar el descuento." };
  }

  revalidateCoupons();

  return { status: "success" };
}
