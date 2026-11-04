"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CatalogProduct } from "../types";

type ProductRowActionsProps = {
  product: CatalogProduct;
};

export function ProductRowActions({ product }: ProductRowActionsProps) {
  const [action, setAction] = useState<"duplicate" | "delete" | null>(null);
  const pendingMessage =
    "El catálogo se conectará a la base de datos en la Fase 4.";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Acciones de ${product.name}`}
          >
            Acciones
            <Icon
              icon="lucide:chevron-down"
              width={13}
              height={13}
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${product.id}`}>Editar</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAction("duplicate")}>
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setAction("delete")}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={action === "duplicate"}
        onOpenChange={(open) => setAction(open ? "duplicate" : null)}
        title="Duplicar producto"
        description={`Se creará una copia de ${product.name} como borrador.`}
        confirmLabel="Duplicar"
        onConfirm={() => {
          setAction(null);
          toast.info(pendingMessage);
        }}
      />

      <ConfirmDialog
        open={action === "delete"}
        onOpenChange={(open) => setAction(open ? "delete" : null)}
        title="Eliminar producto"
        description={`¿Eliminar ${product.name}? Esta acción se habilitará cuando el catálogo esté conectado.`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          setAction(null);
          toast.info(pendingMessage);
        }}
      />
    </>
  );
}
