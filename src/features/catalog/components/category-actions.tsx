"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteCategoryAction } from "../actions";
import type { CategoryWithCount } from "../types";
import { CategoryDialog } from "./category-dialog";

type CategoryActionsProps = {
  category: CategoryWithCount;
};

export function CategoryActions({ category }: CategoryActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        description={`¿Eliminar ${category.name}? No se puede si tiene productos.`}
        confirmLabel="Eliminar"
        tone="danger"
        confirmDisabled={isPending}
        onConfirm={() => {
          startTransition(async () => {
            const result = await deleteCategoryAction(category.id);

            if (result.status === "error") {
              setDeleteOpen(false);
              toast.error(result.message);
              return;
            }

            setDeleteOpen(false);
            toast.success("Categoría eliminada.");
          });
        }}
      />
    </div>
  );
}
