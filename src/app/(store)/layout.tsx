import type { Metadata } from "next";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { getStoreActiveCategoryNames } from "@/features/catalog/store-queries";
import { getCartView } from "@/features/cart/queries";
import { getHomeContent } from "@/features/content/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { STORE_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Mistikax | Ropa para hombre",
    template: "%s | Mistikax",
  },
  description:
    "Mistikax: ropa y calzado para hombre. Polos, camisas, pantalones, casacas, zapatillas y gorras para niños, jóvenes y adultos.",
};

function StoreLoadingFallback() {
  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-50"
        role="status"
        aria-label="Cargando la tienda"
      >
        <span className="sr-only">Cargando la tienda</span>
        <Skeleton className="h-7 w-full rounded-none" />
        <div className="bg-offwhite border-grey-light border-b">
          <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6">
            <Skeleton className="h-8 w-40 rounded-none" />
            <Skeleton className="h-8 w-32 rounded-none" />
          </div>
        </div>
      </div>
      <main className="flex-1 pt-[calc(6.75rem+5rem)]">
        <Skeleton className="h-[calc(100svh-7rem)] min-h-[520px] w-full rounded-none" />
      </main>
      <Skeleton
        className="bg-clay h-64 w-full rounded-none"
        aria-hidden="true"
      />
    </>
  );
}

function StorePageFallback() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-[calc(100svh-7rem)] min-h-[520px] w-full rounded-none" />
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-6 md:grid-cols-3">
        <Skeleton className="aspect-square rounded-none" />
        <Skeleton className="aspect-square rounded-none" />
        <Skeleton className="aspect-square rounded-none" />
      </div>
    </div>
  );
}

async function StoreLayoutContent({ children }: { children: ReactNode }) {
  const categories = await getStoreActiveCategoryNames();
  const settings = await getSiteSettings();
  const homeContent = await getHomeContent();
  const cart = await getCartView();

  const announcement = homeContent.announcement;
  const searchTop = announcement.visible ? "top-[6.75rem]" : "top-20";

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        {announcement.visible ? (
          <AnnouncementBar text={announcement.text} />
        ) : null}
        <StoreHeader nav={STORE_NAV} searchTop={searchTop} cart={cart} />
      </div>
      <main
        className={`flex-1 ${announcement.visible ? "pt-[calc(6.75rem+5rem)]" : "pt-20"}`}
      >
        <Suspense fallback={<StorePageFallback />}>{children}</Suspense>
      </main>
      <StoreFooter categories={categories} settings={settings} />
    </>
  );
}

export default function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="theme-store flex min-h-svh flex-col">
      <Suspense fallback={<StoreLoadingFallback />}>
        <StoreLayoutContent>{children}</StoreLayoutContent>
      </Suspense>
    </div>
  );
}
