import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tienda",
};

export default function StoreHomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center">
      <BrandMark className="mb-12" />

      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
        Nueva tienda en camino
      </p>
      <h1 className="mt-5 max-w-2xl font-heading text-5xl font-light uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl">
        Mistikax se está preparando.
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-grey-dark">
        Estamos migrando el catálogo a una experiencia más rápida. Mientras
        tanto, el equipo puede entrar al panel de administración.
      </p>

      <Button
        asChild
        className="mt-9 h-11 rounded-none bg-foreground px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-background hover:bg-foreground/90"
      >
        <Link href="/login">Ir al panel</Link>
      </Button>

      <p className="mt-12 text-[11px] text-muted-foreground">
        Lima, Perú · Atención por WhatsApp
      </p>
    </main>
  );
}
