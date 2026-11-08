import type { AdminCoupon } from "./types";

export const COUPONS: AdminCoupon[] = [
  {
    code: "BIENVENIDO10",
    kind: "percent",
    value: 10,
    uses: 23,
    maxUses: 0,
    expiresAt: "2026-12-31",
    active: true,
  },
  {
    code: "ENVIOGRATIS",
    kind: "fixed",
    value: 1_500,
    uses: 8,
    maxUses: 50,
    expiresAt: "2026-11-30",
    active: true,
  },
  {
    code: "VERANO20",
    kind: "percent",
    value: 20,
    uses: 41,
    maxUses: 0,
    expiresAt: "2026-03-01",
    active: false,
  },
];
