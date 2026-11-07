import Link from "next/link";

export default function StoreNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-premium font-space-mono mb-4 text-xs font-bold tracking-[0.2em] uppercase">
        Error 404
      </p>
      <h1 className="font-heading text-5xl font-light tracking-[0.05em] uppercase">
        No encontramos esta página
      </h1>
      <p className="text-grey-dark mt-4 max-w-md text-sm leading-relaxed">
        El enlace cambió o el producto ya no está disponible. Vuelve al catálogo
        para seguir comprando.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/catalog"
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Ver catálogo
        </Link>
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
