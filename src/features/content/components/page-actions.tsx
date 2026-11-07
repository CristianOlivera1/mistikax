"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deletePageAction } from "../actions";
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
        description={`¿Eliminar ${page.title}?`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={async () => {
          const result = await deletePageAction(page.id);

          if (result.status === "error") {
            toast.error(result.message);
            return;
          }

          toast.success("Página eliminada.");
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
