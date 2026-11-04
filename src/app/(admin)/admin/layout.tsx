import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebarContent } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import {
  getAdminBadgeCounts,
  getAdminSearchItems,
} from "@/features/dashboard/queries";

export const metadata: Metadata = {
  title: {
    default: "Panel",
    template: "%s | Panel",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const counts = getAdminBadgeCounts();
  const searchItems = getAdminSearchItems();

  return (
    <div className="theme-admin">
      <aside className="border-border bg-card fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r lg:flex">
        <AdminSidebarContent counts={counts} />
      </aside>
      <div className="lg:pl-60">
        <AdminTopbar counts={counts} searchItems={searchItems} />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
