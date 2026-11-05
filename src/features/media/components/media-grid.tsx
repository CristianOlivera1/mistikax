"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { MediaFile } from "../types";

type MediaGridProps = {
  files: MediaFile[];
};

export function MediaGrid({ files }: MediaGridProps) {
  const [pendingDelete, setPendingDelete] = useState<MediaFile | null>(null);

  async function copyUrl(file: MediaFile) {
    try {
      await navigator.clipboard.writeText(
        new URL(file.path, window.location.origin).toString(),
      );
      toast.success("URL copiada.");
    } catch {
      toast.error("No se pudo copiar la URL.");
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {files.map((file) => (
          <div
            key={file.path}
            className="border-border bg-card overflow-hidden rounded-lg border"
          >
            <div className="bg-muted relative aspect-square">
              <Image
                src={file.path}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex gap-1 p-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => copyUrl(file)}
              >
                <Icon
                  icon="lucide:copy"
                  width={13}
                  height={13}
                  aria-hidden="true"
                />
                Copiar URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Eliminar ${file.filename}`}
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(file)}
              >
                <Icon
                  icon="lucide:trash"
                  width={14}
                  height={14}
                  aria-hidden="true"
                />
              </Button>
            </div>
            <p className="text-muted-foreground truncate px-2 pb-2 font-mono text-[11px]">
              {file.filename}
            </p>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Eliminar archivo"
        description={`¿Eliminar ${pendingDelete?.filename ?? "este archivo"}? Esta acción se habilitará cuando los medios estén conectados.`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          setPendingDelete(null);
          toast.info(
            "La eliminación se habilitará cuando los medios estén conectados (Fase 4).",
          );
        }}
      />
    </>
  );
}
