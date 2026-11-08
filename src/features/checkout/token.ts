import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function sign(value: string): string {
  return createHmac("sha256", serverEnv.CART_COOKIE_SECRET)
    .update(value)
    .digest("base64url");
}

export function signOrderToken(orderId: string, number: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const signature = sign(`order:${orderId}:${number}:${expiresAt}`);

  return `${expiresAt}.${signature}`;
}

export function verifyOrderToken(
  orderId: string,
  number: number,
  token: string,
): boolean {
  const separator = token.indexOf(".");

  if (separator <= 0) return false;

  const expiresAt = Number.parseInt(token.slice(0, separator), 10);
  const signature = token.slice(separator + 1);

  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const expected = sign(`order:${orderId}:${number}:${expiresAt}`);

  if (signature.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
