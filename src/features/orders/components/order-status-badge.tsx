import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";

const ORDER_TONES: Record<OrderStatus, StatusTone> = {
  pending: "warning",
  paid: "info",
  shipped: "violet",
  delivered: "success",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <StatusBadge tone={ORDER_TONES[status]}>
      {ORDER_STATUSES[status]}
    </StatusBadge>
  );
}
