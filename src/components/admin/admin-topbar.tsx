"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  AdminBadgeCounts,
  AdminRole,
  AdminSearchItem,
} from "@/lib/nav";
import { AdminSidebarContent } from "./admin-sidebar";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";

type AdminTopbarProps = {
  counts: AdminBadgeCounts;
  searchItems: AdminSearchItem[];
  user: { name: string; email: string; role: AdminRole };
};

export function AdminTopbar({ counts, searchItems, user }: AdminTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const alerts = counts.pendingOrders + counts.lowStock;

  return (
    <header className="border-border bg-card/85 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur lg:px-8">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Abrir menú"
          >
            <Icon
              icon="lucide:menu"
              width={18}
              height={18}
              aria-hidden="true"
            />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="border-border bg-card w-64 gap-0 p-0"
        >
          <SheetTitle className="sr-only">Menú del panel</SheetTitle>
          <AdminSidebarContent
            counts={counts}
            role={user.role}
            user={user}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Breadcrumbs />

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        aria-label="Buscar en el panel"
        className="border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground ml-auto flex h-8 w-8 shrink-0 items-center justify-center gap-2 rounded-md border text-sm transition-colors sm:w-full sm:max-w-60 sm:justify-start sm:px-2.5"
      >
        <Icon icon="lucide:search" width={15} height={15} aria-hidden="true" />
        <span className="hidden flex-1 text-left sm:inline">Buscar...</span>
        <kbd className="border-border bg-card hidden rounded border px-1.5 font-mono text-[11px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label="Notificaciones"
          >
            <Icon
              icon="lucide:bell"
              width={16}
              height={16}
              aria-hidden="true"
            />
            {alerts > 0 ? (
              <span
                className="bg-chart-1 absolute top-1.5 right-1.5 size-1.5 rounded-full"
                aria-hidden="true"
              />
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/orders">
              <Icon
                icon="lucide:shopping-cart"
                width={16}
                height={16}
                aria-hidden="true"
              />
              <span className="flex-1">Pedidos pendientes</span>
              <span className="font-mono text-xs">{counts.pendingOrders}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/inventory">
              <Icon
                icon="lucide:archive"
                width={16}
                height={16}
                aria-hidden="true"
              />
              <span className="flex-1">Productos con stock bajo</span>
              <span className="font-mono text-xs">{counts.lowStock}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CommandPalette
        items={searchItems}
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </header>
  );
}
