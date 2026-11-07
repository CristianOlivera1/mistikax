import { z } from "zod";

export const CART_COOKIE_NAME = "mistikax_cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const CART_MAX_LINES = 30;
export const CART_MAX_QUANTITY = 99;

export const cartLineSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  size: z.string().trim().min(1).max(16),
  colorId: z.string().trim().max(64),
  qty: z.number().int().min(1).max(CART_MAX_QUANTITY),
});

export const cartPayloadSchema = z.object({
  v: z.literal(1),
  lines: z.array(cartLineSchema).max(CART_MAX_LINES),
});

export type CartLine = z.infer<typeof cartLineSchema>;
export type CartPayload = z.infer<typeof cartPayloadSchema>;

export function cartLineKey(line: Pick<CartLine, "productId" | "size" | "colorId">): string {
  return `${line.productId}|${line.size}|${line.colorId}`;
}
