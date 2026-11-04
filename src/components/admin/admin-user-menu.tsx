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
import { ADMIN_USER, ROLES } from "@/lib/constants";

type AdminUserMenuProps = {
  onNavigate?: () => void;
};

export function AdminUserMenu({ onNavigate }: AdminUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm transition-colors"
        >
          <span className="bg-muted text-foreground grid size-5 place-items-center rounded-full text-[10px] font-semibold">
            AD
          </span>
          <span className="text-foreground truncate">{ADMIN_USER.name}</span>
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
            {ADMIN_USER.name}
          </span>
          <span className="text-muted-foreground block text-xs font-normal">
            {ADMIN_USER.email} · {ROLES[ADMIN_USER.role]}
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
        <DropdownMenuItem asChild variant="destructive">
          <Link href="/login" onClick={onNavigate}>
            <Icon
              icon="lucide:log-out"
              width={16}
              height={16}
              aria-hidden="true"
            />
            Cerrar sesión
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
