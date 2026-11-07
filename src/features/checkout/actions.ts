"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orderStatusHistory,
  orders,
  productStock,
} from "@/db/schema";
import { getStoreProduct } from "@/features/catalog/store-queries";
import { clearCartCookie, readCartCookie } from "@/features/cart/cookie";
import { getSiteSettings } from "@/features/settings/queries";
import { computeCartTotals } from "@/features/cart/totals";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatMoney } from "@/lib/format";
import { checkoutSchema, type CheckoutInput } from "./schema";
import { signOrderToken } from "./token";

export type CheckoutResult =
  | {
      status: "success";
      orderId: string;
      number: number;
      token: string;
      totalCents: number;
      whatsappUrl: string;
    }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

type ResolvedLine = {
  productId: string;
  productName: string;
  productImage: string;
  priceCents: number;
  size: string;
  colorName: string;
  quantity: number;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export async function createOrderAction(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }

    return {
      status: "error",
      message: "Revisa los datos del formulario.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const lines = await readCartCookie();

  if (lines.length === 0) {
    return { status: "error", message: "Tu carrito está vacío." };
  }

  const settings = await getSiteSettings();
  const resolved: ResolvedLine[] = [];

  for (const line of lines) {
    const product = await getStoreProduct(line.productId);

    if (!product) {
      return {
        status: "error",
        message: "Un producto de tu carrito ya no está disponible. Quítalo para continuar.",
      };
    }

    const stock = product.stock[line.size] ?? 0;

    if (stock < line.qty) {
      const suffix = stock === 0 ? "ya no tiene stock" : `solo tiene ${stock} unidades`;
      return {
        status: "error",
        message: `${product.name} en talla ${line.size} ${suffix}. Ajusta tu carrito.`,
      };
    }

    resolved.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] ?? "",
      priceCents: product.priceCents,
      size: line.size,
      colorName:
        product.colors.find((color) => color.id === line.colorId)?.name ?? "",
      quantity: line.qty,
    });
  }

  const totals = computeCartTotals(
    resolved.map((line) => ({ priceCents: line.priceCents, qty: line.quantity })),
    {
      shippingCents: settings.shippingCents,
      freeShippingCents: settings.freeShippingCents,
    },
  );

  let orderId = "";
  let number = 0;

  try {
    await db.transaction(async (tx) => {
      const [sequence] = await tx
        .select({ value: sql<number>`coalesce(max(${orders.number}), 1000)::int` })
        .from(orders);
      number = Number(sequence?.value ?? 1000) + 1;
      orderId = `ord_${number}`;

      await tx.insert(orders).values({
        id: orderId,
        number,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        address: data.address,
        status: "pending",
        paymentMethod: data.paymentMethod,
        shippingCents: totals.shippingCents,
        subtotalCents: totals.subtotalCents,
        totalCents: totals.totalCents,
        note: data.note,
      });

      await tx.insert(orderItems).values(
        resolved.map((line) => ({
          orderId,
          productId: line.productId,
          productName: line.productName,
          productImage: line.productImage,
          priceCents: line.priceCents,
          size: line.size,
          colorName: line.colorName,
          quantity: line.quantity,
        })),
      );

      for (const line of resolved) {
        const updated = await tx
          .update(productStock)
          .set({ quantity: sql`${productStock.quantity} - ${line.quantity}` })
          .where(
            sql`${productStock.productId} = ${line.productId} and ${productStock.size} = ${line.size} and ${productStock.quantity} >= ${line.quantity}`,
          )
          .returning({ quantity: productStock.quantity });

        if (updated.length === 0) {
          throw new Error(
            `${line.productName} en talla ${line.size} se quedó sin stock.`,
          );
        }
      }

      await tx
        .insert(orderStatusHistory)
        .values({ orderId, status: "pending", changedBy: "checkout" });
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.length > 0
          ? error.message
          : "No pudimos registrar tu pedido. Inténtalo otra vez.",
    };
  }

  await clearCartCookie();

  const messageLines = resolved
    .map(
      (line) =>
        `• ${line.quantity} × ${line.productName} (talla ${line.size}) — ${formatMoney(
          line.priceCents * line.quantity,
        )}`,
    )
    .join("\n");
  const whatsappUrl = buildWhatsAppLink(
    digitsOnly(settings.whatsapp),
    `Hola, acabo de hacer el pedido #${number} en ${settings.storeName}.\n\n${messageLines}\n\nTotal: ${formatMoney(totals.totalCents)}`,
  );

  return {
    status: "success",
    orderId,
    number,
    token: signOrderToken(orderId, number),
    totalCents: totals.totalCents,
    whatsappUrl,
  };
}

export async function lookupOrderForConfirmation(
  orderId: string,
  number: number,
): Promise<{ customerName: string; totalCents: number; status: string } | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.number !== number) return null;

  return {
    customerName: order.customerName,
    totalCents: order.totalCents,
    status: order.status,
  };
}
