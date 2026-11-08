import type {
  ShippingMethod,
  ShippingZone,
} from "@/features/checkout/shipping";
import type { OrderStatus } from "@/lib/constants";

export type OrderStatusFilter = OrderStatus | "all";

export type PaymentMethod = "card" | "transfer" | "cod";

export type OrderFilters = {
  status: OrderStatusFilter;
  query: string;
  page: number;
};

export type OrderPage = {
  items: AdminOrder[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  from: number;
  to: number;
};

export const ORDERS_PAGE_SIZE = 20;

export type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  priceCents: number;
  size: string;
  colorName: string;
  quantity: number;
};

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
};

export type AdminOrder = {
  id: string;
  number: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  shippingMethod: ShippingMethod;
  shippingZone: ShippingZone;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  shippingCents: number;
  note: string;
  createdAt: string;
  history: OrderStatusEvent[];
};

export const PAYMENT_METHOD_LABELS = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cod: "Contra entrega",
} as const;

export function getOrderSubtotalCents(order: AdminOrder): number {
  return order.items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );
}

export function getOrderTotalCents(order: AdminOrder): number {
  return getOrderSubtotalCents(order) + order.shippingCents;
}

export function getOrderItemCount(order: AdminOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}
