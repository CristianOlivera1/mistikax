"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { CategoryWithCount } from "../types";
import { CategoryDialog } from "./category-dialog";

type CategoryActionsProps = {
  category: CategoryWithCount;
};

export function CategoryActions({ category }: CategoryActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDelete() {
    if (category.productCount > 0) {
      toast.error(
        `No se puede eliminar: tiene ${category.productCount} productos.`,
      );
      return;
    }

    setDeleteOpen(true);
  }

  return (
    <div className="flex justify-end gap-1">
      <CategoryDialog category={category} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        Eliminar
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar categoría"
        description={`¿Eliminar ${category.name}? Esta acción se habilitará cuando el catálogo esté conectado.`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          setDeleteOpen(false);
          toast.info(
            "La eliminación se habilitará cuando el catálogo esté conectado (Fase 4).",
          );
        }}
      />
    </div>
  );
}
