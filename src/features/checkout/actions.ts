"use server";

import { headers } from "next/headers";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  coupons,
  orderItems,
  orderStatusHistory,
  orders,
  productStock,
  products,
} from "@/db/schema";
import { getStoreProduct } from "@/features/catalog/store-queries";
import { clearCartCookie, readCartCookie } from "@/features/cart/cookie";
import { getCustomerSession } from "@/features/customer-auth/queries";
import { getSiteSettings } from "@/features/settings/queries";
import {
  availableShippingMethods,
  resolveShippingCents,
  SHIPPING_METHOD_LABELS,
  type ShippingZone,
} from "./shipping";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatMoney } from "@/lib/format";
import { checkRateLimit } from "@/lib/rate-limit";
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

class StockError extends Error {}

class CouponError extends Error {}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function successFromExistingOrder(
  order: typeof orders.$inferSelect,
): CheckoutResult {
  return {
    status: "success",
    orderId: order.id,
    number: order.number,
    token: signOrderToken(order.id, order.number),
    totalCents: order.totalCents,
    whatsappUrl: "",
  };
}

export async function createOrderAction(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientKey = forwardedFor || headerList.get("x-real-ip") || "local";

  if (!checkRateLimit(`checkout:${clientKey}`, 10, 10 * 60 * 1000).ok) {
    return {
      status: "error",
      message:
        "Hiciste varios pedidos seguidos. Espera unos minutos e inténtalo de nuevo.",
    };
  }

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
  const [existingOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.idempotencyKey, data.idempotencyKey))
    .limit(1);

  if (existingOrder) return successFromExistingOrder(existingOrder);

  const lines = await readCartCookie();

  if (lines.length === 0) {
    const [committedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.idempotencyKey, data.idempotencyKey))
      .limit(1);

    if (committedOrder) return successFromExistingOrder(committedOrder);

    return { status: "error", message: "Tu carrito está vacío." };
  }

  const settings = await getSiteSettings();
  const paymentAllowed =
    data.paymentMethod === "transfer"
      ? settings.paymentTransfer
      : data.paymentMethod === "cod"
        ? settings.paymentCod
        : false;

  if (!paymentAllowed) {
    return {
      status: "error",
      message: "Ese método de pago no está disponible.",
    };
  }

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

    const color = product.colors.find(
      (productColor) => productColor.id === line.colorId,
    );

    if (!color) {
      return {
        status: "error",
        message: `Elige un color válido para ${product.name}.`,
      };
    }

    resolved.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] ?? "",
      priceCents: product.priceCents,
      size: line.size,
      colorName: color.name,
      quantity: line.qty,
    });
  }

  const method = data.shippingMethod;

  if (!availableShippingMethods(settings).includes(method)) {
    return {
      status: "error",
      message: "Ese método de entrega no está disponible.",
    };
  }

  const zone: ShippingZone =
    method === "courier"
      ? "provinces"
      : method === "pickup"
        ? "lima"
        : data.shippingZone === "lima-outer"
          ? "lima-outer"
          : "lima";
  const subtotalCents = resolved.reduce(
    (total, line) => total + line.priceCents * line.quantity,
    0,
  );
  const shippingCents = resolveShippingCents({
    method,
    zone,
    subtotalCents,
    settings,
  });
  const totals = {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };

  let discountCents = 0;
  let couponCode: string | null = null;

  if (data.couponCode) {
    const code = data.couponCode.toUpperCase();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (!coupon) {
      return {
        status: "error",
        message: "El código de descuento no existe.",
        fieldErrors: { couponCode: "Código no válido." },
      };
    }

    if (!coupon.active) {
      return {
        status: "error",
        message: "Este código ya no está activo.",
        fieldErrors: { couponCode: "Código inactivo." },
      };
    }

    if (Date.parse(`${coupon.expiresAt}T23:59:59.999Z`) < Date.now()) {
      return {
        status: "error",
        message: "Este código ya expiró.",
        fieldErrors: { couponCode: "Código expirado." },
      };
    }

    if (coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) {
      return {
        status: "error",
        message: "Este código ya alcanzó su límite de usos.",
        fieldErrors: { couponCode: "Código agotado." },
      };
    }

    if (coupon.kind === "percent") {
      discountCents = Math.round((subtotalCents * coupon.value) / 100);
    } else {
      discountCents = coupon.value;
    }

    discountCents = Math.min(discountCents, subtotalCents);
    couponCode = code;
    totals.totalCents = subtotalCents - discountCents + shippingCents;
  }

  const customer = await getCustomerSession();

  let orderId = "";
  let number = 0;
  let existingOrderId: string | null = null;
  let existingNumber = 0;
  let existingTotalCents = 0;

  try {
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${data.idempotencyKey}))`,
      );

      const [duplicate] = await tx
        .select()
        .from(orders)
        .where(eq(orders.idempotencyKey, data.idempotencyKey))
        .limit(1);

      if (duplicate) {
        existingOrderId = duplicate.id;
        existingNumber = duplicate.number;
        existingTotalCents = duplicate.totalCents;
        return;
      }

      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('mistikax_order_number'))`,
      );

      const [sequence] = await tx
        .select({ value: sql<number>`coalesce(max(${orders.number}), 1000)::int` })
        .from(orders);
      number = Number(sequence?.value ?? 1000) + 1;
      orderId = `ord_${number}`;

      await tx.insert(orders).values({
        id: orderId,
        number,
        idempotencyKey: data.idempotencyKey,
        customerId: customer?.id ?? null,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        address: data.address,
        shippingMethod: method,
        shippingZone: zone,
        status: "pending",
        paymentMethod: data.paymentMethod,
        shippingCents: totals.shippingCents,
        subtotalCents: totals.subtotalCents,
        discountCents,
        totalCents: totals.totalCents,
        couponCode,
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

      const productIds = [...new Set(resolved.map((line) => line.productId))];
      await tx
        .select({ id: products.id })
        .from(products)
        .where(inArray(products.id, productIds))
        .for("update");

      for (const line of resolved) {
        const updated = await tx
          .update(productStock)
          .set({ quantity: sql`${productStock.quantity} - ${line.quantity}` })
          .where(
            sql`${productStock.productId} = ${line.productId} and ${productStock.size} = ${line.size} and ${productStock.quantity} >= ${line.quantity}`,
          )
          .returning({ quantity: productStock.quantity });

        if (updated.length === 0) {
          throw new StockError(
            `${line.productName} en talla ${line.size} se quedó sin stock.`,
          );
        }
      }

      const soldByProduct = new Map<string, number>();
      for (const line of resolved) {
        soldByProduct.set(
          line.productId,
          (soldByProduct.get(line.productId) ?? 0) + line.quantity,
        );
      }

      for (const [productId, quantity] of soldByProduct) {
        await tx
          .update(products)
          .set({ soldCount: sql`${products.soldCount} + ${quantity}` })
          .where(eq(products.id, productId));
      }

      await tx
        .insert(orderStatusHistory)
        .values({ orderId, status: "pending", changedBy: "checkout" });

      if (couponCode) {
        const [usedCoupon] = await tx
          .update(coupons)
          .set({ uses: sql`${coupons.uses} + 1` })
          .where(
            and(
              eq(coupons.code, couponCode),
              eq(coupons.active, true),
              sql`${coupons.expiresAt} >= current_date`,
              sql`(${coupons.maxUses} = 0 OR ${coupons.uses} < ${coupons.maxUses})`,
            ),
          )
          .returning({ code: coupons.code });

        if (!usedCoupon) {
          throw new CouponError(
            "El código de descuento ya no está disponible. Vuelve a intentarlo.",
          );
        }
      }
    });
  } catch (error) {
    if (error instanceof CouponError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: { couponCode: error.message },
      };
    }

    return {
      status: "error",
      message:
        error instanceof StockError
          ? error.message
          : "No pudimos registrar tu pedido. Inténtalo otra vez.",
    };
  }

  if (existingOrderId) {
    return {
      status: "success",
      orderId: existingOrderId,
      number: existingNumber,
      token: signOrderToken(existingOrderId, existingNumber),
      totalCents: existingTotalCents,
      whatsappUrl: "",
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
    `Hola, acabo de hacer el pedido #${number} en ${settings.storeName}.\n\n${messageLines}\n\nEntrega: ${SHIPPING_METHOD_LABELS[method]}\nTotal: ${formatMoney(totals.totalCents)}`,
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
