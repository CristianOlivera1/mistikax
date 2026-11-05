"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { ContentPage } from "../types";

type PageActionsProps = {
  page: ContentPage;
};

export function PageActions({ page }: PageActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        Eliminar
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar página"
        description={`¿Eliminar ${page.title}? Esta acción se habilitará cuando las páginas estén conectadas.`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          setDeleteOpen(false);
          toast.info(
            "La eliminación se habilitará cuando las páginas estén conectadas (Fase 5).",
          );
        }}
      />
    </>
  );
}
