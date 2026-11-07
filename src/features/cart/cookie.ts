import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import {
  CART_COOKIE_MAX_AGE,
  CART_COOKIE_NAME,
  CART_MAX_LINES,
  cartPayloadSchema,
  type CartLine,
} from "./schema";

const DEVELOPMENT_SECRET = "mistikax-development-cart-secret-change-me-please";

function getSecret(): string {
  return serverEnv.CART_COOKIE_SECRET ?? DEVELOPMENT_SECRET;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function encodeCart(lines: CartLine[]): string {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, lines: lines.slice(0, CART_MAX_LINES) }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function decodeCart(value: string | undefined): CartLine[] {
  if (!value) return [];

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return [];

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sign(payload);

  if (signature.length !== expected.length) return [];

  const valid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );

  if (!valid) return [];

  try {
    const parsed = cartPayloadSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );

    return parsed.success ? parsed.data.lines : [];
  } catch {
    return [];
  }
}

export async function readCartCookie(): Promise<CartLine[]> {
  const store = await cookies();
  return decodeCart(store.get(CART_COOKIE_NAME)?.value);
}

export async function writeCartCookie(lines: CartLine[]): Promise<void> {
  const store = await cookies();

  if (lines.length === 0) {
    store.delete(CART_COOKIE_NAME);
    return;
  }

  store.set(CART_COOKIE_NAME, encodeCart(lines), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function clearCartCookie(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE_NAME);
}
