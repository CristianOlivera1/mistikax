import "server-only";

import { getSiteSettings } from "@/features/settings/queries";
import { getStoreProductsByIds } from "@/features/catalog/store-queries";
import { readCartCookie } from "./cookie";
import { cartLineKey, type CartLine } from "./schema";
import { computeCartTotals, type CartTotals } from "./totals";

export type CartLineView = {
  key: string;
  productId: string;
  name: string;
  image: string;
  priceCents: number;
  size: string;
  colorId: string;
  colorName: string;
  qty: number;
  stock: number;
  available: boolean;
};

export type CartView = {
  lines: CartLineView[];
  totals: CartTotals;
  shippingCents: number;
  freeShippingCents: number;
};

export async function getCartLines(rawLines: CartLine[]): Promise<CartLineView[]> {
  if (rawLines.length === 0) return [];

  const productsList = await getStoreProductsByIds(
    rawLines.map((line) => line.productId),
  );
  const productById = new Map(productsList.map((product) => [product.id, product]));

  return rawLines.map((line) => {
    const product = productById.get(line.productId);
    const stock = product?.stock[line.size] ?? 0;
    const color = product?.colors.find((item) => item.id === line.colorId);

    return {
      key: cartLineKey(line),
      productId: line.productId,
      name: product?.name ?? "Producto no disponible",
      image: product?.images[0] ?? "",
      priceCents: product?.priceCents ?? 0,
      size: line.size,
      colorId: line.colorId,
      colorName: color?.name ?? "",
      qty: line.qty,
      stock,
      available: Boolean(product) && stock >= line.qty,
    };
  });
}

export async function getCartView(): Promise<CartView> {
  const [lines, settings] = await Promise.all([readCartCookie(), getSiteSettings()]);
  const views = await getCartLines(lines);
  const purchasable = views.filter((line) => line.available);
  const totals = computeCartTotals(purchasable, {
    shippingCents: settings.shippingCents,
    freeShippingCents: settings.freeShippingCents,
  });

  return {
    lines: views,
    totals,
    shippingCents: settings.shippingCents,
    freeShippingCents: settings.freeShippingCents,
  };
}

export async function getCartCount(): Promise<number> {
  const lines = await readCartCookie();
  return lines.reduce((total, line) => total + line.qty, 0);
}
