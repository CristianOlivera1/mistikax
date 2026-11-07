"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? "";

  return (
    <div className="space-y-3">
      <div className="border-grey-light bg-surface relative aspect-[4/5] overflow-hidden border">
        {current ? (
          <Image
            src={current}
            alt={name}
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${name}`}
              aria-pressed={index === active}
              className={cn(
                "relative h-24 w-20 shrink-0 overflow-hidden border transition-colors",
                index === active ? "border-dark" : "border-grey-light hover:border-grey-mid",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                unoptimized
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
