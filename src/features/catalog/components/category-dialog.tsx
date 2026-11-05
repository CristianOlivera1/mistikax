"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SIZE_TYPES } from "../constants";
import { categorySchema, type CategoryValues } from "../schema";
import { slugify } from "@/lib/slug";
import type { CatalogCategory } from "../types";

type CategoryDialogProps = {
  category?: CatalogCategory;
};

export function CategoryDialog({ category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const defaultValues: CategoryValues = {
    name: category?.name ?? "",
    sizeType: category?.sizeType ?? "clothing",
  };
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const name = useWatch({ control: form.control, name: "name" });
  const previewId = category?.id ?? (slugify(name) || "categoria");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) form.reset(defaultValues);
  }

  function onSubmit() {
    setOpen(false);
    form.reset(defaultValues);
    toast.info(
      "La categoría está validada. El guardado se habilitará en la Fase 4.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {category ? (
          <Button type="button" variant="ghost" size="sm">
            Editar
          </Button>
        ) : (
          <Button type="button">
            <Icon
              icon="lucide:plus"
              width={14}
              height={14}
              aria-hidden="true"
            />
            Nueva categoría
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>
              {category ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              El tipo de talla define las opciones del inventario y del editor
              de producto.
            </DialogDescription>
          </DialogHeader>

          <FormField
            label="Nombre"
            htmlFor="category-name"
            error={errors.name?.message}
          >
            <Input
              id="category-name"
              placeholder="Polos"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
          </FormField>

          <FormField
            label="Tipo de tallas"
            htmlFor="category-size-type"
            error={errors.sizeType?.message}
          >
            <NativeSelect
              id="category-size-type"
              aria-invalid={Boolean(errors.sizeType)}
              {...form.register("sizeType")}
            >
              {Object.entries(SIZE_TYPES).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </FormField>

          <p className="text-muted-foreground text-xs">
            Identificador:{" "}
            <span className="text-foreground font-mono">{previewId}</span>
          </p>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
