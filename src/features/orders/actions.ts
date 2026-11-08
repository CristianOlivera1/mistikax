"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  orderItems,
  orderStatusHistory,
  orders,
  productStock,
  products,
} from "@/db/schema";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { requireRole } from "@/features/auth/queries";
import {
  buildStockRestoreDeltas,
  canTransitionOrderStatus,
  statusTransitionRestoresStock,
} from "./service";

type OrderActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

const orderIdSchema = z.string().trim().min(1).max(64);

const noteSchema = z
  .string()
  .trim()
  .max(500, "La nota no debe superar los 500 caracteres.");

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
}

export async function transitionOrderStatusAction(
  rawOrderId: string,
  next: OrderStatus,
): Promise<OrderActionResult> {
  const session = await requireRole("admin");

  const parsedId = orderIdSchema.safeParse(rawOrderId);

  if (!parsedId.success) {
    return { status: "error", message: "Pedido no válido." };
  }

  const orderId = parsedId.data;

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
        .for("update");

      if (!order) {
        throw new Error("El pedido no existe.");
      }

      if (!canTransitionOrderStatus(order.status, next)) {
        throw new Error(
          `No se puede pasar de ${ORDER_STATUSES[order.status].toLowerCase()} a ${ORDER_STATUSES[next].toLowerCase()}.`,
        );
      }

      if (statusTransitionRestoresStock(next)) {
        const itemRows = await tx
          .select({
            productId: orderItems.productId,
            size: orderItems.size,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, orderId))
          .orderBy(asc(orderItems.id));
        const restoreLines = itemRows.flatMap((row) =>
          row.productId
            ? [
                {
                  productId: row.productId,
                  size: row.size,
                  quantity: row.quantity,
                },
              ]
            : [],
        );

        for (const delta of buildStockRestoreDeltas(restoreLines)) {
          await tx
            .update(productStock)
            .set({
              quantity: sql`${productStock.quantity} + ${delta.restoreQuantity}`,
            })
            .where(
              and(
                eq(productStock.productId, delta.productId),
                eq(productStock.size, delta.size),
              ),
            );
        }

        const soldByProduct = new Map<string, number>();
        for (const row of itemRows) {
          if (!row.productId) continue;
          soldByProduct.set(
            row.productId,
            (soldByProduct.get(row.productId) ?? 0) + row.quantity,
          );
        }

        for (const [productId, quantity] of soldByProduct) {
          await tx
            .update(products)
            .set({
              soldCount: sql`greatest(0, ${products.soldCount} - ${quantity})`,
            })
            .where(eq(products.id, productId));
        }
      }

      await tx
        .update(orders)
        .set({ status: next, updatedAt: new Date() })
        .where(eq(orders.id, orderId));
      await tx
        .insert(orderStatusHistory)
        .values({ orderId, status: next, changedBy: session.email });
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del pedido.",
    };
  }

  revalidateOrderPaths(orderId);

  return { status: "success" };
}

export async function updateOrderNoteAction(
  rawOrderId: string,
  rawNote: string,
): Promise<OrderActionResult> {
  await requireRole("admin");

  const parsedId = orderIdSchema.safeParse(rawOrderId);
  const parsedNote = noteSchema.safeParse(rawNote);

  if (!parsedId.success || !parsedNote.success) {
    return { status: "error", message: "Pedido o nota no válidos." };
  }

  try {
    const result = await db
      .update(orders)
      .set({ note: parsedNote.data, updatedAt: new Date() })
      .where(eq(orders.id, parsedId.data))
      .returning({ id: orders.id });

    if (result.length === 0) {
      return { status: "error", message: "El pedido no existe." };
    }
  } catch {
    return { status: "error", message: "No se pudo guardar la nota." };
  }

  revalidateOrderPaths(parsedId.data);

  return { status: "success" };
}
