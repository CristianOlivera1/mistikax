"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons/icon";
import { BrandMark } from "@/components/shared/brand-mark";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STORE_MOBILE_NAV } from "@/lib/nav";
import { CartSheet } from "@/features/cart/components/cart-sheet";
import { signOutCustomerAction } from "@/features/customer-auth/actions";
import type { CartLineView } from "@/features/cart/queries";
import type { CartTotals } from "@/features/cart/totals";

type StoreHeaderActionsProps = {
  customer: { fullName: string; email: string } | null;
  cart: {
    lines: CartLineView[];
    totals: CartTotals;
    freeShippingCents: number;
  };
};

export function StoreHeaderActions({
  customer,
  cart,
}: StoreHeaderActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!accountOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

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
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Abrir menú"
              className="p-2 xl:hidden"
            >
              <Icon icon="lucide:menu" width={22} height={22} />
            </button>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="theme-store !fixed !inset-0 !left-0 !top-0 !z-[100] !h-dvh !max-h-dvh !w-full !max-w-none !translate-x-0 !translate-y-0 !gap-0 !rounded-none !border-0 !p-0 flex flex-col overflow-hidden bg-offwhite text-foreground sm:!max-w-none"
          >
            <div className="border-grey-light flex shrink-0 items-center justify-between border-b px-5 py-4">
              <BrandMark />
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="p-2"
                >
                  <Icon icon="lucide:x" width={24} height={24} />
                </button>
              </DialogClose>
            </div>
            <DialogHeader className="shrink-0 px-6 pt-6 pb-3 text-left">
              <DialogTitle className="font-heading text-2xl tracking-wide uppercase">
                Explora la tienda
              </DialogTitle>
              <DialogDescription className="text-grey-dark">
                Encuentra prendas, ofertas y ayuda.
              </DialogDescription>
            </DialogHeader>
            <nav
              aria-label="Navegación móvil"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6"
            >
              <ul className="grid grid-cols-2 gap-x-4">
                {STORE_MOBILE_NAV.map((item) => (
                  <li
                    key={`${item.label}-${item.href}`}
                    className="border-grey-light border-b"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center justify-between gap-2 py-3 text-sm font-medium"
                    >
                      <span>{item.label}</span>
                      <Icon
                        icon="lucide:arrow-right"
                        width={16}
                        height={16}
                        aria-hidden="true"
                        className="shrink-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-grey-light bg-offwhite shrink-0 border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {customer ? (
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="min-w-0"
                  >
                    <span className="block text-xs font-semibold">
                      Mi cuenta
                    </span>
                    <span className="text-grey-dark block truncate text-xs">
                      {customer.email}
                    </span>
                  </Link>
                  <form action={signOutCustomerAction}>
                    <button
                      type="submit"
                      className="text-destructive shrink-0 text-xs font-semibold"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/account/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="bg-dark text-white block px-4 py-3 text-center text-xs font-bold tracking-widest uppercase"
                >
                  Entrar a mi cuenta
                </Link>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <CartSheet
          lines={cart.lines}
          totals={cart.totals}
          freeShippingCents={cart.freeShippingCents}
        />

        {customer ? (
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-label="Mi cuenta"
              className="flex items-center gap-1.5 p-2"
            >
              <Icon icon="lucide:user" width={22} height={22} />
              <span className="hidden max-w-24 truncate text-xs font-medium lg:inline">
                {customer.fullName.split(" ")[0]}
              </span>
            </button>

            {accountOpen ? (
              <div
                role="menu"
                className="border-grey-light bg-offwhite absolute top-full right-0 z-50 mt-1 w-56 border p-2 shadow-lg"
              >
                <p className="text-grey-dark truncate px-2 py-1 text-[10px] tracking-widest uppercase">
                  {customer.email}
                </p>
                <Link
                  role="menuitem"
                  href="/account"
                  onClick={() => setAccountOpen(false)}
                  className="hover:bg-grey-light/40 block px-2 py-2 text-sm"
                >
                  Mi cuenta
                </Link>
                <form action={signOutCustomerAction}>
                  <button
                    role="menuitem"
                    type="submit"
                    className="text-destructive hover:bg-grey-light/40 block w-full px-2 py-2 text-left text-sm"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href="/account/sign-in"
            className="hover:text-premium-hover px-2 text-[11px] font-bold tracking-widest uppercase"
          >
            Entrar
          </Link>
        )}

        <Link
          href="/pages/contact"
          className="bg-premium hover:bg-premium-hover hover:text-offwhite ml-2 hidden items-center px-6 py-3 text-xs font-bold tracking-wider transition-all md:flex"
        >
          CONTACTO
        </Link>
      </div>

      {searchOpen ? (
        <div
          className="border-grey-light bg-offwhite absolute inset-x-0 top-full z-50 border-t"
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

    </>
  );
}
