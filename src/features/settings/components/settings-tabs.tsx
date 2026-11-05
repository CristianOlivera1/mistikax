import Link from "next/link";
import { cn } from "@/lib/utils";
import { SETTINGS_TABS, type SettingsTab } from "../types";

type SettingsTabsProps = {
  active: SettingsTab;
};

export function SettingsTabs({ active }: SettingsTabsProps) {
  return (
    <nav
      className="border-border flex gap-5 overflow-x-auto border-b"
      aria-label="Secciones de configuración"
    >
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.value === active;

        return (
          <Link
            key={tab.value}
            href={
              tab.value === "general"
                ? "/admin/settings"
                : `/admin/settings?tab=${tab.value}`
            }
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "border-b-2 py-3 text-sm whitespace-nowrap transition-colors",
              isActive
                ? "border-foreground text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
