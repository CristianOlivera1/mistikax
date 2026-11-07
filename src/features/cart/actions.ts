"use server";

import { revalidatePath } from "next/cache";
import { getStoreProduct } from "@/features/catalog/store-queries";
import { cartLineSchema } from "./schema";
import { readCartCookie, writeCartCookie } from "./cookie";
import type { CartLine } from "./schema";

export type CartActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

function revalidateStore() {
  revalidatePath("/", "layout");
}

function parseQuantity(value: number): number | null {
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function addToCartAction(input: {
  productId: string;
  size: string;
  colorId: string;
  qty: number;
}): Promise<CartActionResult> {
  const parsed = cartLineSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "error", message: "Elige una talla válida." };
  }

  const product = await getStoreProduct(parsed.data.productId);

  if (!product) {
    return { status: "error", message: "Este producto ya no está disponible." };
  }

  const stock = product.stock[parsed.data.size] ?? 0;

  if (stock <= 0) {
    return { status: "error", message: "Esa talla está agotada." };
  }

  const requested = parseQuantity(parsed.data.qty) ?? 1;
  const lines = await readCartCookie();
  const key = `${parsed.data.productId}|${parsed.data.size}|${parsed.data.colorId}`;
  const existing = lines.find(
    (line) => `${line.productId}|${line.size}|${line.colorId}` === key,
  );
  const nextQty = (existing?.qty ?? 0) + requested;

  if (nextQty > stock) {
    return {
      status: "error",
      message: `Solo quedan ${stock} unidades en talla ${parsed.data.size}.`,
    };
  }

  const nextLines: CartLine[] = existing
    ? lines.map((line) => (line === existing ? { ...line, qty: nextQty } : line))
    : [...lines, { ...parsed.data, qty: requested }];

  await writeCartCookie(nextLines);
  revalidateStore();

  return { status: "success" };
}

export async function updateCartQuantityAction(
  key: string,
  quantity: number,
): Promise<CartActionResult> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { status: "error", message: "Cantidad no válida." };
  }

  const lines = await readCartCookie();
  const target = lines.find(
    (line) => `${line.productId}|${line.size}|${line.colorId}` === key,
  );

  if (!target) {
    return { status: "error", message: "Ese producto ya no está en el carrito." };
  }

  if (quantity === 0) {
    await writeCartCookie(
      lines.filter(
        (line) => `${line.productId}|${line.size}|${line.colorId}` !== key,
      ),
    );
    revalidateStore();
    return { status: "success" };
  }

  const product = await getStoreProduct(target.productId);
  const stock = product?.stock[target.size] ?? 0;

  if (quantity > stock) {
    return {
      status: "error",
      message: `Solo quedan ${stock} unidades en talla ${target.size}.`,
    };
  }

  await writeCartCookie(
    lines.map((line) =>
      `${line.productId}|${line.size}|${line.colorId}` === key
        ? { ...line, qty: quantity }
        : line,
    ),
  );
  revalidateStore();

  return { status: "success" };
}

export async function removeCartLineAction(key: string): Promise<CartActionResult> {
  return updateCartQuantityAction(key, 0);
}

export async function clearCartAction(): Promise<CartActionResult> {
  await writeCartCookie([]);
  revalidateStore();

  return { status: "success" };
}
