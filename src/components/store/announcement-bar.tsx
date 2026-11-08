"use client";

import { Icon } from "@/components/icons/icon";

type AnnouncementBarProps = {
  text: string;
  onDismiss: () => void;
};

export function AnnouncementBar({ text, onDismiss }: AnnouncementBarProps) {
  return (
    <div className="bg-foreground text-background relative flex min-h-7 items-center justify-center px-12 py-2 text-center text-[11px] font-medium tracking-[0.2em] uppercase">
      {text}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar anuncio"
        className="absolute top-1/2 right-3 -translate-y-1/2 p-1"
      >
        <Icon icon="lucide:x" width={16} height={16} />
      </button>
    </div>
  );
}
