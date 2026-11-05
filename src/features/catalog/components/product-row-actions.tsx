"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { archiveProductAction, duplicateProductAction } from "../actions";
import type { CatalogProduct } from "../types";

type ProductRowActionsProps = {
  product: CatalogProduct;
};

export function ProductRowActions({ product }: ProductRowActionsProps) {
  const router = useRouter();
  const [action, setAction] = useState<"duplicate" | "archive" | null>(null);
  const [isPending, startTransition] = useTransition();

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
            onSelect={() => setAction("archive")}
          >
            Archivar
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
          startTransition(async () => {
            const result = await duplicateProductAction(product.id);

            if (result.status === "error") {
              setAction(null);
              toast.error(result.message);
              return;
            }

            setAction(null);
            toast.success("Producto duplicado.");
            router.push(`/admin/products/${result.id}`);
            router.refresh();
          });
        }}
        confirmDisabled={isPending}
      />

      <ConfirmDialog
        open={action === "archive"}
        onOpenChange={(open) => setAction(open ? "archive" : null)}
        title="Archivar producto"
        description={`¿Archivar ${product.name}? Dejará de mostrarse en la tienda y podrás reactivarlo más adelante.`}
        confirmLabel="Archivar"
        tone="danger"
        onConfirm={() => {
          startTransition(async () => {
            await archiveProductAction(product.id);
            setAction(null);
            toast.success("Producto archivado.");
            router.refresh();
          });
        }}
        confirmDisabled={isPending}
      />
    </>
  );
}
