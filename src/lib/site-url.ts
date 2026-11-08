import "server-only";

import { headers } from "next/headers";

function configuredOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export async function getSiteOrigin(): Promise<string> {
  const configured = configuredOrigin();

  if (configured) return configured;

  const headerList = await headers();
  const host = (
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000"
  )
    .split(",")[0]
    .trim();
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${protocol}://${host}`;
}
