import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Panel en preparación",
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
      <header className="flex items-center justify-between gap-4 border-b border-border pb-6">
        <BrandMark />
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Ir al login</Link>
        </Button>
      </header>

      <section className="flex flex-1 items-center py-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-chart-1" aria-hidden="true" />
            Fase 0 · Fundaciones
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            El panel ya tiene su base.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            La app vive en <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">src</code>,
            con shadcn, los dos temas y el login listo. El siguiente bloque es el
            shell del admin y el Resumen.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/login">
                Ver el login
                <Icon icon="lucide:arrow-right" width={15} height={15} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Ver la tienda</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
