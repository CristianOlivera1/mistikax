import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { getCustomerSession } from "@/features/customer-auth/queries";
import { getCustomerOrders } from "@/features/customer-auth/order-queries";
import { signOutCustomerAction } from "@/features/customer-auth/actions";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();

  if (!session) redirect("/account/sign-in");

  const customerOrders = await getCustomerOrders(session.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <p className="text-grey-dark text-[11px] font-medium tracking-[0.22em] uppercase">
        Mi cuenta
      </p>
      <h1 className="text-dark mt-3 text-3xl font-light tracking-tight sm:text-4xl">
        Hola, {session.fullName}
      </h1>
      <p className="text-grey-dark mt-3 text-sm leading-relaxed">
        Esta es la cuenta con la que compras en Mistikax.
      </p>

      <div className="border-grey-light mt-8 border bg-white p-6 sm:p-8">
        <dl className="space-y-4 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-grey-dark">Nombre</dt>
            <dd className="text-dark font-medium">{session.fullName}</dd>
          </div>
          <div className="border-grey-light flex flex-col gap-1 border-t pt-4 sm:flex-row sm:justify-between">
            <dt className="text-grey-dark">Correo</dt>
            <dd className="text-dark font-medium">{session.email}</dd>
          </div>
        </dl>

        <form action={signOutCustomerAction} className="mt-8">
          <button
            type="submit"
            className="border-dark hover:bg-dark hover:text-offwhite flex items-center gap-2 border px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <div className="mt-12">
        <h2 className="text-dark text-xl font-light tracking-tight">
          Mis pedidos
        </h2>

        {customerOrders.length === 0 ? (
          <div className="border-grey-light mt-4 border px-6 py-10 text-center">
            <p className="text-grey-dark text-sm">
              Aún no tienes pedidos. ¡Explora el catálogo!
            </p>
            <Link
              href="/catalog"
              className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite mt-4 inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <ul className="border-grey-light mt-4 divide-y border">
            {customerOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-2 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="text-dark text-sm font-semibold">
                    Pedido #{order.number}
                  </span>
                  <span className="text-grey-dark ml-3 text-xs">
                    {order.createdAt.toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {order.statusLabel}
                  </span>
                  <span className="text-dark text-sm font-semibold">
                    {order.totalFormatted}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/catalog"
        className="text-dark mt-8 inline-flex items-center gap-2 text-sm underline underline-offset-4"
      >
        <Icon icon="lucide:arrow-left" width={15} height={15} aria-hidden="true" />
        Seguir comprando
      </Link>
    </div>
  );
}
