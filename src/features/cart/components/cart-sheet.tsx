"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShippingProgress } from "@/components/store/shipping-progress";
import { CartLines } from "./cart-lines";
import { CartSummary } from "./cart-summary";
import type { CartLineView } from "@/features/cart/queries";
import type { CartTotals } from "@/features/cart/totals";

type CartSheetProps = {
  lines: CartLineView[];
  totals: CartTotals;
  freeShippingCents: number;
};

export function CartSheet({ lines, totals, freeShippingCents }: CartSheetProps) {
  const [open, setOpen] = useState(false);
  const count = lines.reduce((total, line) => total + line.qty, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Carrito, ${count} productos`}
          className="relative p-2"
        >
          <ShoppingBag className="size-5" aria-hidden="true" />
          {count > 0 ? (
            <span className="bg-premium text-dark absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full text-[9px] font-bold">
              {count}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 px-5 sm:max-w-md">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle className="font-heading text-xl tracking-widest uppercase">
            Tu carrito
          </SheetTitle>
          <SheetDescription>
            Revisa tallas y cantidades antes de pagar.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <CartLines lines={lines} />
        </div>

        {lines.length > 0 ? (
          <div className="border-grey-light space-y-4 border-t pt-4 pb-2">
            <ShippingProgress
              subtotalCents={totals.subtotalCents}
              freeShippingCents={freeShippingCents}
            />
            <CartSummary totals={totals} estimate />
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="bg-dark text-background hover:bg-premium hover:text-dark block w-full px-6 py-4 text-center text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Ir a pagar
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="border-dark hover:bg-dark hover:text-background block w-full border px-6 py-3 text-center text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Ver carrito
            </Link>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
