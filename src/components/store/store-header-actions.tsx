"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons/icon";
import { STORE_MOBILE_NAV } from "@/lib/nav";
import { CartSheet } from "@/features/cart/components/cart-sheet";
import type { CartLineView } from "@/features/cart/queries";
import type { CartTotals } from "@/features/cart/totals";

type StoreHeaderActionsProps = {
  searchTop: string;
  cart: {
    lines: CartLineView[];
    totals: CartTotals;
    freeShippingCents: number;
  };
};

export function StoreHeaderActions({ searchTop, cart }: StoreHeaderActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    const query = typeof value === "string" ? value.trim() : "";
    setSearchOpen(false);
    router.push(`/catalog${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen((open) => !open)}
          aria-expanded={searchOpen}
          aria-label="Buscar"
          className="p-2"
        >
          <Icon icon="lucide:search" width={22} height={22} />
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-label="Abrir menú"
          className="p-2 xl:hidden"
        >
          <Icon icon="lucide:menu" width={22} height={22} />
        </button>
        <CartSheet
          lines={cart.lines}
          totals={cart.totals}
          freeShippingCents={cart.freeShippingCents}
        />
        <Link
          href="/pages/contacto"
          className="bg-premium hover:bg-premium-hover hover:text-offwhite ml-2 hidden items-center px-6 py-3 text-xs font-bold tracking-wider transition-all md:flex"
        >
          CONTACTO
        </Link>
      </div>

      {searchOpen ? (
        <div
          className={`border-grey-light bg-offwhite fixed inset-x-0 z-50 border-t ${searchTop}`}
        >
          <form
            role="search"
            onSubmit={submitSearch}
            className="mx-auto flex max-w-[1400px] gap-3 px-6 py-3"
          >
            <input
              name="q"
              type="search"
              placeholder="Buscar polos, zapatillas, gorras..."
              aria-label="Buscar productos"
              className="border-dark placeholder:text-dark/30 focus:ring-dark w-full border bg-white p-3 text-sm focus:ring-1 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-dark hover:bg-premium hover:text-dark w-24 text-xs font-bold tracking-widest text-white uppercase transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      ) : null}

      {menuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className="bg-offwhite fixed inset-0 z-[60] overflow-y-auto px-6 pt-24 pb-10"
        >
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="absolute top-6 right-6 p-2"
          >
            <Icon icon="lucide:x" width={24} height={24} />
          </button>
          <div className="flex flex-col gap-1">
            {STORE_MOBILE_NAV.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-grey-light border-b pt-3 pb-4 text-xl font-light"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
