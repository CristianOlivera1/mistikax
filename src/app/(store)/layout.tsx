import type { Metadata } from "next";
import { Manrope, Montserrat, Oswald, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";

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

export const metadata: Metadata = {
  title: "Tienda",
};

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`theme-store ${manrope.variable} ${oswald.variable} ${montserrat.variable} ${spaceMono.variable}`}
    >
      {children}
    </div>
  );
}
