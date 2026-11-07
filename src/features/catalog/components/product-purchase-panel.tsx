"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { SizeGuideDialog } from "@/components/store/size-guide-dialog";
import { addToCartAction } from "@/features/cart/actions";
import { formatMoney } from "@/lib/format";
import { AGE_GROUPS } from "@/lib/constants";
import type { StoreProduct } from "@/features/catalog/store-queries";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type ProductPurchasePanelProps = {
  product: StoreProduct;
  whatsappPhone: string;
};

function orderedSizes(stock: Record<string, number>): string[] {
  return Object.keys(stock).sort((a, b) => {
    const numberA = Number.parseInt(a, 10);
    const numberB = Number.parseInt(b, 10);

    if (Number.isFinite(numberA) && Number.isFinite(numberB)) return numberA - numberB;
    return a.localeCompare(b, "es");
  });
}

export function ProductPurchasePanel({
  product,
  whatsappPhone,
}: ProductPurchasePanelProps) {
  const sizes = orderedSizes(product.stock);
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const hasOffer =
    product.compareAtCents !== null && product.compareAtCents > product.priceCents;
  const maxStock = size ? (product.stock[size] ?? 0) : 1;

  function addToCart() {
    if (!size) {
      setError("Elige una talla para continuar.");
      return;
    }

    setError(null);
    setAdded(false);
    startTransition(async () => {
      const result = await addToCartAction({
        productId: product.id,
        size,
        colorId,
        qty: quantity,
      });

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setAdded(true);
    });
  }

  const whatsappUrl = buildWhatsAppLink(
    whatsappPhone,
    `Hola, me interesa ${product.name}${size ? ` en talla ${size}` : ""} (${formatMoney(product.priceCents)}). ¿Está disponible?`,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-grey-dark font-space-mono mb-2 text-[10px] tracking-widest uppercase">
          {product.categoryName} / {AGE_GROUPS[product.ageGroup]}
        </p>
        <h1 className="font-heading text-4xl leading-none font-light tracking-[0.04em] uppercase md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-3 text-lg">
          <b className="font-semibold">{formatMoney(product.priceCents)}</b>
          {hasOffer ? (
            <s className="text-grey-mid ml-2 font-normal">
              {formatMoney(product.compareAtCents ?? 0)}
            </s>
          ) : null}
        </p>
      </div>

      {product.colors.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-xs font-bold tracking-widest uppercase">
            Color
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setColorId(color.id)}
                aria-pressed={colorId === color.id}
                title={color.name}
                className={cn(
                  "flex items-center gap-2 border px-3 py-2 text-xs transition-colors",
                  colorId === color.id
                    ? "border-dark bg-offwhite"
                    : "border-grey-light hover:border-grey-mid",
                )}
              >
                <span
                  aria-hidden="true"
                  className="border-grey-light size-4 rounded-full border"
                  style={{ background: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <div className="mb-2 flex items-end justify-between gap-3">
          <legend className="text-xs font-bold tracking-widest uppercase">
            Talla
          </legend>
          <SizeGuideDialog age={product.ageGroup} />
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((value) => {
            const stock = product.stock[value] ?? 0;
            const disabled = stock <= 0;

            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSize(value);
                  setQuantity(1);
                  setError(null);
                  setAdded(false);
                }}
                aria-pressed={size === value}
                className={cn(
                  "min-w-12 border px-3 py-2.5 text-xs transition-colors",
                  size === value
                    ? "border-dark bg-dark text-white"
                    : "border-grey-light hover:border-grey-mid",
                  disabled && "text-grey-mid border-grey-light cursor-not-allowed line-through",
                )}
                title={disabled ? "Agotado" : `${stock} disponibles`}
              >
                {value}
              </button>
            );
          })}
        </div>
        {size ? (
          <p className="text-grey-dark mt-2 text-[11px]">
            {product.stock[size] ?? 0} unidades disponibles en talla {size}.
          </p>
        ) : null}
      </fieldset>

      <div className="flex items-center gap-4">
        <div className="border-grey-light flex items-center border">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Quitar una unidad"
            className="hover:bg-offwhite p-3 transition-colors disabled:opacity-40"
          >
            <Minus className="size-3" />
          </button>
          <span className="w-10 text-center text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(maxStock, value + 1))}
            disabled={quantity >= maxStock}
            aria-label="Agregar una unidad"
            className="hover:bg-offwhite p-3 transition-colors disabled:opacity-40"
          >
            <Plus className="size-3" />
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={pending}
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite flex-1 px-6 py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-60"
        >
          {pending ? "Agregando…" : "Agregar al carrito"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-error text-xs">
          {error}
        </p>
      ) : null}
      {added ? (
        <p role="status" className="text-xs">
          Agregado al carrito.{" "}
          <Link href="/cart" className="underline underline-offset-4">
            Ver carrito
          </Link>
        </p>
      ) : null}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        className="border-dark hover:bg-dark hover:text-background block border px-6 py-4 text-center text-xs font-bold tracking-widest uppercase transition-colors"
      >
        Comprar por WhatsApp
      </a>

      {product.description ? (
        <div className="border-grey-light border-t pt-6">
          <h2 className="mb-2 text-xs font-bold tracking-widest uppercase">
            Descripción
          </h2>
          <p className="text-grey-dark text-sm leading-relaxed">
            {product.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
