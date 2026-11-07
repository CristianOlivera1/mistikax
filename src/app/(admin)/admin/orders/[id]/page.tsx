import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderNoteForm } from "@/features/orders/components/order-note-form";
import { OrderStatusActions } from "@/features/orders/components/order-status-actions";
import { getOrderById, getOrderWhatsAppHref } from "@/features/orders/queries";
import {
  PAYMENT_METHOD_LABELS,
  getOrderItemCount,
  getOrderSubtotalCents,
  getOrderTotalCents,
} from "@/features/orders/types";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return {
    title: `Pedido #${order.number}`,
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const subtotal = getOrderSubtotalCents(order);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Pedido #${order.number}`}
        description={`${formatDateTime(order.createdAt)} · ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`}
        backHref="/admin/orders"
        actions={
          <>
            <OrderStatusBadge status={order.status} />
            <Button asChild variant="outline">
              <a
                href={getOrderWhatsAppHref(order)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  icon="lucide:message-circle"
                  width={14}
                  height={14}
                  aria-hidden="true"
                />
                WhatsApp
              </a>
            </Button>
            <OrderStatusActions orderId={order.id} status={order.status} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Productos"
            description={`${getOrderItemCount(order)} unidades`}
          >
            <div className="divide-border divide-y">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${item.colorName}-${index}`}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <ProductThumb
                    name={item.productName}
                    src={item.productImage}
                    className="size-11"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="truncate font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      Talla {item.size} · {item.colorName}
                    </p>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {item.quantity} × {formatMoney(item.priceCents)}
                  </span>
                  <span className="w-24 text-right text-sm font-medium">
                    {formatMoney(item.priceCents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-border bg-muted/20 space-y-1.5 border-t px-5 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>
                  {order.shippingCents === 0
                    ? "Gratis"
                    : formatMoney(order.shippingCents)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(getOrderTotalCents(order))}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Notas internas" bodyClassName="p-5">
            <OrderNoteForm orderId={order.id} note={order.note} />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Cliente" bodyClassName="space-y-1 p-5">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
            <p className="text-muted-foreground">{order.customerPhone}</p>
            <p className="text-muted-foreground mt-3 text-sm">
              Entrega en {order.customerCity}
            </p>
          </SectionCard>

          <SectionCard title="Historial" bodyClassName="p-5">
            <ol className="border-border space-y-3 border-l pl-4">
              {[...order.history].reverse().map((event) => (
                <li key={`${event.status}-${event.at}`} className="relative">
                  <span
                    className="border-card bg-foreground absolute top-1 -left-[21px] size-2.5 rounded-full border-2"
                    aria-hidden="true"
                  />
                  <p className="font-medium">{ORDER_STATUSES[event.status]}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(event.at)}
                  </p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
