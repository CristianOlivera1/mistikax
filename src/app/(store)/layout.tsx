import type { Metadata } from "next";
import { Manrope, Montserrat, Oswald, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { getStoreActiveCategoryNames } from "@/features/catalog/store-queries";
import { getHomeContent } from "@/features/content/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { STORE_NAV } from "@/lib/nav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Mistikax | Ropa para hombre",
    template: "%s | Mistikax",
  },
  description:
    "Mistikax: ropa y calzado para hombre. Polos, camisas, pantalones, casacas, zapatillas y gorras para niños, jóvenes y adultos.",
};

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [categories, settings, homeContent] = await Promise.all([
    getStoreActiveCategoryNames(),
    getSiteSettings(),
    getHomeContent(),
  ]);

  const announcement = homeContent.announcement;
  const searchTop = announcement.visible ? "top-[6.75rem]" : "top-20";

  return (
    <div
      className={`theme-store ${manrope.variable} ${oswald.variable} ${montserrat.variable} ${spaceMono.variable} flex min-h-svh flex-col`}
    >
      <div className="fixed inset-x-0 top-0 z-50">
        {announcement.visible ? (
          <AnnouncementBar text={announcement.text} />
        ) : null}
        <StoreHeader nav={STORE_NAV} searchTop={searchTop} />
      </div>
      <main
        className={`flex-1 ${announcement.visible ? "pt-[calc(6.75rem+5rem)]" : "pt-20"}`}
      >
        {children}
      </main>
      <StoreFooter categories={categories} settings={settings} />
    </div>
  );
}
