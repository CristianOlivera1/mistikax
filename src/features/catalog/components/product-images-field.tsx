"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
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
import { cn } from "@/lib/utils";

type ProductImagesFieldProps = {
  name: string;
  images: string[];
  library: string[];
  onChange: (images: string[]) => void;
};

export function ProductImagesField({
  name,
  images,
  library,
  onChange,
}: ProductImagesFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const available = library.filter((src) => !images.includes(src));

  function makePrimary(src: string) {
    onChange([src, ...images.filter((item) => item !== src)]);
  }

  function remove(src: string) {
    onChange(images.filter((item) => item !== src));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          La primera imagen se usa como principal.
        </p>
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Icon
                icon="lucide:plus"
                width={14}
                height={14}
                aria-hidden="true"
              />
              Añadir imagen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Imágenes de ejemplo</DialogTitle>
              <DialogDescription>
                Selecciona una imagen local para este producto. La subida real
                llega en la Fase 4.
              </DialogDescription>
            </DialogHeader>
            {available.length > 0 ? (
              <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
                {available.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => onChange([...images, src])}
                    className="border-border bg-muted focus-visible:border-ring focus-visible:ring-ring/50 relative aspect-square overflow-hidden rounded-md border transition-opacity outline-none hover:opacity-80 focus-visible:ring-3"
                    aria-label="Añadir imagen"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="160px"
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Ya añadiste todas las imágenes disponibles.
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Listo
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="border-border bg-muted relative aspect-square overflow-hidden rounded-md border"
          >
            <Image
              src={src}
              alt={`${name || "Producto"} ${index + 1}`}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-black/55 p-1">
              {index === 0 ? (
                <span className="bg-background/90 text-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                  Principal
                </span>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  className="h-5 px-1.5 text-[10px]"
                  onClick={() => makePrimary(src)}
                >
                  Principal
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="xs"
                className={cn("h-5 px-1.5 text-[10px]")}
                onClick={() => remove(src)}
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
