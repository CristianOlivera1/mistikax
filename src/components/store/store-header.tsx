import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import type { StoreNavItem } from "@/lib/nav";
import type { CartLineView } from "@/features/cart/queries";
import type { CartTotals } from "@/features/cart/totals";
import { StoreHeaderActions } from "./store-header-actions";

type StoreHeaderProps = {
  nav: readonly StoreNavItem[];
  searchTop: string;
  cart: {
    lines: CartLineView[];
    totals: CartTotals;
    freeShippingCents: number;
  };
};

export function StoreHeader({ nav, searchTop, cart }: StoreHeaderProps) {
  return (
    <header className="bg-offwhite/95 border-grey-light w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Mistikax inicio"
        >
          <BrandMark />
        </Link>
        <nav
          className="text-grey-dark hidden items-center gap-4 text-xs font-medium tracking-widest uppercase xl:flex xl:gap-6"
          aria-label="Principal"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-premium-hover transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <StoreHeaderActions searchTop={searchTop} cart={cart} />
      </div>
    </header>
  );
}
