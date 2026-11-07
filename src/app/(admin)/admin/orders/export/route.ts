import { getAllOrdersForPage } from "@/features/orders/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await getAllOrdersForPage();
  const payload = {
    store: "mistikax",
    exportedAt: new Date().toISOString(),
    count: orders.length,
    orders: orders.map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      paymentMethod: order.paymentMethod,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        city: order.customerCity,
      },
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        priceCents: item.priceCents,
        size: item.size,
        colorName: item.colorName,
        quantity: item.quantity,
      })),
      shippingCents: order.shippingCents,
      note: order.note,
      createdAt: order.createdAt,
    })),
  };
  const body = JSON.stringify(payload, null, 2);
  const stamp = payload.exportedAt.slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
