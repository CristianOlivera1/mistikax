"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-premium font-space-mono mb-4 text-xs font-bold tracking-[0.2em] uppercase">
        Algo salió mal
      </p>
      <h1 className="font-heading text-5xl font-light tracking-[0.05em] uppercase">
        No pudimos cargar esta página
      </h1>
      <p className="text-grey-dark mt-4 max-w-md text-sm leading-relaxed">
        Revisa tu conexión y vuelve a intentar. Si el problema continúa,
        escríbenos por WhatsApp y resolvemos tu pedido en el chat.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border-dark hover:bg-dark hover:text-background border px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
