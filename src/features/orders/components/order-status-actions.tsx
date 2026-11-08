"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { transitionOrderStatusAction } from "../actions";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "paid",
  paid: "shipped",
  shipped: "delivered",
};

type OrderStatusActionsProps = {
  orderId: string;
  status: OrderStatus;
};

export function OrderStatusActions({
  orderId,
  status,
}: OrderStatusActionsProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nextStatus = NEXT_STATUS[status];
  const canCancel = status === "pending" || status === "paid";

  if (!nextStatus && !canCancel) return null;

  function transition(next: OrderStatus) {
    startTransition(async () => {
      const result = await transitionOrderStatusAction(orderId, next);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(`Pedido ${ORDER_STATUSES[next].toLowerCase()}.`);

      if (next === "cancelled") setCancelOpen(false);
    });
  }

  return (
    <>
      {canCancel ? (
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => setCancelOpen(true)}
        >
          Cancelar
        </Button>
      ) : null}
      {nextStatus ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => transition(nextStatus)}
        >
          {isPending
            ? "Guardando..."
            : `Marcar como ${ORDER_STATUSES[nextStatus].toLowerCase()}`}
        </Button>
      ) : null}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar pedido"
        description="El pedido dejará de facturarse y el stock de sus productos se restaurará una sola vez."
        confirmLabel="Cancelar pedido"
        tone="danger"
        confirmDisabled={isPending}
        onConfirm={() => transition("cancelled")}
      />
    </>
  );
}
