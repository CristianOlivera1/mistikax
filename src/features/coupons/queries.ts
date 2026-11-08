import "server-only";

import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons as couponsTable } from "@/db/schema";
import type { AdminCoupon } from "./types";

export async function getCoupons(): Promise<AdminCoupon[]> {
  const rows = await db
    .select()
    .from(couponsTable)
    .orderBy(desc(couponsTable.createdAt), asc(couponsTable.code));

  return rows.map((row) => ({
    code: row.code,
    kind: row.kind,
    value: row.value,
    uses: row.uses,
    maxUses: row.maxUses,
    expiresAt: row.expiresAt,
    active: row.active,
  }));
}

export function isCouponExpired(coupon: AdminCoupon): boolean {
  return Date.parse(`${coupon.expiresAt}T23:59:59.999Z`) < Date.now();
}
