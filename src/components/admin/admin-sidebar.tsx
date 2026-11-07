"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { BrandMark } from "@/components/shared/brand-mark";
import {
  filterAdminNavForRole,
  isNavItemActive,
  type AdminBadgeCounts,
  type AdminRole,
} from "@/lib/nav";
import { cn } from "@/lib/utils";
import { AdminUserMenu } from "./admin-user-menu";

type AdminSidebarContentProps = {
  counts: AdminBadgeCounts;
  role: AdminRole;
  user: { name: string; email: string; role: AdminRole };
  onNavigate?: () => void;
};

export function AdminSidebarContent({
  counts,
  role,
  user,
  onNavigate,
}: AdminSidebarContentProps) {
  const pathname = usePathname();
  const nav = filterAdminNavForRole(role);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
        <BrandMark />
      </div>

      <nav
        className="flex-1 space-y-5 overflow-y-auto p-3"
        aria-label="Navegación principal"
      >
        {nav.map((group) => (
          <div key={group.label ?? "panel"}>
            {group.label ? (
              <p className="text-muted-foreground mb-1 px-2 text-xs font-medium">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                const badge = item.badge ? counts[item.badge] : 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                        active && "bg-muted text-foreground font-medium",
                      )}
                    >
                      <Icon
                        icon={item.icon}
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                      {badge > 0 ? (
                        <span className="bg-card text-foreground ring-border ml-auto rounded-full px-1.5 font-mono text-[11px] ring-1">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-border space-y-1 border-t p-3">
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors"
        >
          <Icon
            icon="lucide:external-link"
            width={16}
            height={16}
            aria-hidden="true"
          />
          Ver tienda
        </Link>
        <AdminUserMenu
          name={user.name}
          email={user.email}
          role={user.role}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
