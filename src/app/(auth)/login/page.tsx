import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { BrandMark } from "@/components/shared/brand-mark";
import { LoginForm } from "@/features/auth/components/login-form";
import { getAdminSession } from "@/features/auth/queries";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

const features = [
  {
    icon: "lucide:layout-dashboard",
    title: "Catálogo y stock",
    description: "Productos, tallas, precios y disponibilidad en un solo lugar.",
  },
  {
    icon: "lucide:chart-column",
    title: "Pedidos y ventas",
    description: "Revisa la actividad de la tienda y atiende cada pedido a tiempo.",
  },
  {
    icon: "lucide:shield-check",
    title: "Acceso del equipo",
    description: "Entra con tu cuenta y trabaja con los permisos de tu rol.",
  },
];

export default async function LoginPage() {
  const session = await getAdminSession();

  if (session) redirect("/admin");

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden min-h-svh flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex xl:p-14">
        <Icon
          icon="lucide:store"
          width={360}
          height={360}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-20 size-80 text-background/5"
        />

        <div className="relative">
          <BrandMark framed className="w-fit" />
          <p className="mt-16 text-[11px] font-medium uppercase tracking-[0.2em] text-background/50">
            Panel de administración
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight text-background xl:text-5xl">
            Todo Mistikax,
            <br />
            en un solo lugar.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/60">
            Gestiona el catálogo, los pedidos y el contenido de la tienda desde
            un panel claro y rápido.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-background/10 bg-background/5 text-background/70">
                  <Icon icon={feature.icon} width={17} height={17} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-background">
                    {feature.title}
                  </span>
                  <span className="mt-0.5 block max-w-xs text-xs leading-relaxed text-background/50">
                    {feature.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between border-t border-background/10 pt-5 text-[11px] text-background/40">
          <span>© 2026 Mistikax</span>
          <span>Lima, Perú</span>
        </div>
      </aside>

      <main className="relative flex min-h-svh items-center justify-center px-6 py-12 sm:px-10">
        <Link
          href="/"
          className="absolute right-6 top-6 hidden text-[13px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:inline-flex"
        >
          Ver tienda
        </Link>

        <div className="w-full max-w-[380px]">
          <div className="lg:hidden">
            <BrandMark />
          </div>

          <div className="mt-10 lg:mt-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Panel de administración
            </p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-tight">
              Accede a tu panel
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Ingresa con tu cuenta para gestionar la tienda.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-7 text-center text-xs leading-relaxed text-muted-foreground">
            ¿Necesitas acceso?{" "}
            <a
              href="mailto:hola@mistikax.com?subject=Acceso%20al%20panel%20Mistikax"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Contacta al administrador
            </a>
            .
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <Icon icon="lucide:shield-check" width={14} height={14} aria-hidden="true" />
            Acceso exclusivo del equipo de Mistikax
          </div>
        </div>
      </main>
    </div>
  );
}
