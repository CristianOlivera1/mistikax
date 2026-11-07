"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import {
  removeCartLineAction,
  updateCartQuantityAction,
} from "@/features/cart/actions";
import type { CartLineView } from "@/features/cart/queries";

type CartLinesProps = {
  lines: CartLineView[];
  compact?: boolean;
};

export function CartLines({ lines, compact = false }: CartLinesProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function changeQuantity(line: CartLineView, quantity: number) {
    setPendingKey(line.key);
    setError(null);
    startTransition(async () => {
      const result = await updateCartQuantityAction(line.key, quantity);
      if (result.status === "error") setError(result.message);
      setPendingKey(null);
    });
  }

  function remove(line: CartLineView) {
    setPendingKey(line.key);
    setError(null);
    startTransition(async () => {
      const result = await removeCartLineAction(line.key);
      if (result.status === "error") setError(result.message);
      setPendingKey(null);
    });
  }

  if (lines.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="font-heading text-xl tracking-wide uppercase">
          Tu carrito está vacío
        </p>
        <Link
          href="/catalog"
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite mt-6 inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-grey-light divide-y">
      {lines.map((line) => {
        const busy = pendingKey === line.key;

        return (
          <div key={line.key} className="flex gap-4 py-4">
            <Link
              href={`/product/${line.productId}`}
              className="bg-surface border-grey-light relative h-24 w-20 shrink-0 overflow-hidden border"
            >
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/product/${line.productId}`}
                    className="hover:text-premium-hover block truncate text-sm font-medium transition-colors"
                  >
                    {line.name}
                  </Link>
                  <p className="text-grey-dark mt-1 text-[11px] tracking-wide uppercase">
                    Talla {line.size}
                    {line.colorName ? ` · ${line.colorName}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line)}
                  disabled={busy}
                  aria-label={`Quitar ${line.name}`}
                  className="text-grey-mid hover:text-error p-1 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {!line.available ? (
                <p className="text-error mt-2 text-[11px]">
                  {line.stock === 0
                    ? "Agotado en esta talla."
                    : `Solo quedan ${line.stock} unidades.`}
                </p>
              ) : null}

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="border-grey-light flex items-center border">
                  <button
                    type="button"
                    onClick={() => changeQuantity(line, line.qty - 1)}
                    disabled={busy}
                    aria-label="Quitar una unidad"
                    className="hover:bg-offwhite p-2 transition-colors disabled:opacity-50"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-8 text-center text-xs" aria-live="polite">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(line, line.qty + 1)}
                    disabled={busy || line.qty >= line.stock}
                    aria-label="Agregar una unidad"
                    className="hover:bg-offwhite p-2 transition-colors disabled:opacity-50"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
                <p className="text-sm font-semibold">
                  {formatMoney(line.priceCents * line.qty)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      {error ? (
        <p role="alert" className="text-error py-3 text-xs">
          {error}
        </p>
      ) : null}
      {!compact ? null : null}
    </div>
  );
}
