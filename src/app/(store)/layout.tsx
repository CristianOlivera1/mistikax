import type { Metadata } from "next";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreShell } from "@/components/store/store-shell";
import { getHomeContent } from "@/features/content/queries";
import {
  StoreFooterData,
  StoreHeaderData,
} from "./store-layout-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Mistikax | Ropa para hombre",
    template: "%s | Mistikax",
  },
  description:
    "Mistikax: ropa y calzado para hombre. Polos, camisas, pantalones, casacas, zapatillas y gorras para niños, jóvenes y adultos.",
};

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

function StoreHeaderFallback() {
  return (
    <div className="bg-offwhite border-grey-light h-20 border-b">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        <Skeleton className="h-8 w-40 rounded-none" />
        <Skeleton className="h-8 w-32 rounded-none" />
      </div>
    </div>
  );
}

function StoreFooterFallback() {
  return <Skeleton className="bg-clay mt-auto h-64 w-full rounded-none" />;
}

export default function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const announcement = getHomeContent().then(({ announcement }) => announcement);

  return (
    <div className="theme-store flex min-h-svh flex-col">
      <StoreShell
        announcement={announcement}
        header={
          <Suspense fallback={<StoreHeaderFallback />}>
            <StoreHeaderData />
          </Suspense>
        }
      >
        <Suspense fallback={<StorePageFallback />}>{children}</Suspense>
      </StoreShell>
      <Suspense fallback={<StoreFooterFallback />}>
        <StoreFooterData />
      </Suspense>
    </div>
  );
}
