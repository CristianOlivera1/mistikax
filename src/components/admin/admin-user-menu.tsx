"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminRole } from "@/lib/nav";
import { signOutAction } from "@/features/auth/actions";

type AdminUserMenuProps = {
  name: string;
  email: string;
  role: AdminRole;
  onNavigate?: () => void;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminUserMenu({
  name,
  email,
  role,
  onNavigate,
}: AdminUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm transition-colors"
        >
          <span className="bg-muted text-foreground grid size-5 place-items-center rounded-full text-[10px] font-semibold">
            {initials(name)}
          </span>
          <span className="text-foreground truncate">{name}</span>
          <Icon
            icon="lucide:chevron-down"
            width={14}
            height={14}
            aria-hidden="true"
            className="ml-auto"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel>
          <span className="text-foreground block text-sm font-medium">
            {name}
          </span>
          <span className="text-muted-foreground block text-xs font-normal">
            {email} · {role === "admin" ? "Administrador" : "Editor"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" onClick={onNavigate}>
            <Icon
              icon="lucide:settings"
              width={16}
              height={16}
              aria-hidden="true"
            />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" target="_blank" onClick={onNavigate}>
            <Icon
              icon="lucide:store"
              width={16}
              height={16}
              aria-hidden="true"
            />
            Ver tienda
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" onClick={onNavigate} className="w-full">
              <Icon
                icon="lucide:log-out"
                width={16}
                height={16}
                aria-hidden="true"
              />
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
