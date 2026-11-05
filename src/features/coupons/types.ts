export type CouponKind = "percent" | "fixed";

export type AdminCoupon = {
  code: string;
  kind: CouponKind;
  value: number;
  uses: number;
  expiresAt: string;
  active: boolean;
};
