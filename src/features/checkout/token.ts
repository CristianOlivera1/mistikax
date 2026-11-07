import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

const DEVELOPMENT_SECRET = "mistikax-development-cart-secret-change-me-please";

function getSecret(): string {
  return serverEnv.CART_COOKIE_SECRET ?? DEVELOPMENT_SECRET;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function signOrderToken(orderId: string, number: number): string {
  return sign(`order:${orderId}:${number}`);
}

export function verifyOrderToken(
  orderId: string,
  number: number,
  token: string,
): boolean {
  const expected = signOrderToken(orderId, number);

  if (token.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
