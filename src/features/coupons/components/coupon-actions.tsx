"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteCouponAction } from "../actions";
import type { AdminCoupon } from "../types";
import { CouponDialog } from "./coupon-dialog";

type CouponActionsProps = {
  coupon: AdminCoupon;
};

export function CouponActions({ coupon }: CouponActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex justify-end gap-1">
      <CouponDialog coupon={coupon} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        Eliminar
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar descuento"
        description={`¿Eliminar el código ${coupon.code}?`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={async () => {
          const result = await deleteCouponAction(coupon.code);

          if (result.status === "error") {
            toast.error(result.message);
            return;
          }

          toast.success("Descuento eliminado.");
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
