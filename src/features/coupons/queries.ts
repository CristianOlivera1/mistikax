import "server-only";

import { COUPONS } from "./fixtures";
import type { AdminCoupon } from "./types";

export function getCoupons(): AdminCoupon[] {
  return COUPONS;
}

export function isCouponExpired(coupon: AdminCoupon): boolean {
  return Date.parse(`${coupon.expiresAt}T23:59:59.999Z`) < Date.now();
}
