"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { AdminSearchItem } from "@/lib/nav";

type CommandPaletteProps = {
  items: AdminSearchItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({
  items,
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const groups = items.reduce<Record<string, AdminSearchItem[]>>(
    (accumulator, item) => {
      (accumulator[item.group] ??= []).push(item);
      return accumulator;
    },
    {},
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar en el panel"
      description="Busca secciones, productos o pedidos."
    >
      <CommandInput placeholder="Ir a una sección o buscar un producto..." />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        {Object.entries(groups).map(([group, groupItems]) => (
          <CommandGroup key={group} heading={group}>
            {groupItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.href}`}
                onSelect={() => {
                  onOpenChange(false);
                  router.push(item.href);
                }}
              >
                <Icon
                  icon={item.icon}
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
