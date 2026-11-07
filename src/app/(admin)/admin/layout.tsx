import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { AdminSidebarContent } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAdminBadgeCounts,
  getAdminSearchItems,
} from "@/features/dashboard/queries";
import { getAdminSession } from "@/features/auth/queries";
import { canAccessAdminPath } from "@/lib/nav";

export const metadata: Metadata = {
  title: {
    default: "Panel",
    template: "%s | Panel",
  },
  robots: { index: false, follow: false },
};

function AdminLayoutFallback() {
  return (
    <div
      className="theme-admin min-h-svh bg-background"
      role="status"
      aria-label="Cargando el panel"
    >
      <span className="sr-only">Cargando el panel</span>
      <aside className="border-border bg-card fixed inset-y-0 left-0 hidden w-60 flex-col gap-5 border-r p-5 lg:flex">
        <Skeleton className="mb-4 h-7 w-36" />
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </aside>
      <div className="lg:pl-60">
        <header className="border-border bg-card flex h-14 items-center justify-between border-b px-6">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8 lg:px-8">
          <Skeleton className="h-7 w-32" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[104px] rounded-lg" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-[300px] rounded-lg lg:col-span-2" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </main>
      </div>
    </div>
  );
}

async function AdminLayoutContent({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) redirect("/login");

  const pathname = (await headers()).get("x-pathname") ?? "/admin";

  if (!canAccessAdminPath(session.role, pathname)) redirect("/admin");

  const counts = await getAdminBadgeCounts();
  const searchItems = await getAdminSearchItems();

  return (
    <div className="theme-admin">
      <aside className="border-border bg-card fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r lg:flex">
        <AdminSidebarContent
          counts={counts}
          role={session.role}
          user={{
            name: session.fullName,
            email: session.email,
            role: session.role,
          }}
        />
      </aside>
      <div className="lg:pl-60">
        <AdminTopbar
          counts={counts}
          searchItems={searchItems}
          user={{
            name: session.fullName,
            email: session.email,
            role: session.role,
          }}
        />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
