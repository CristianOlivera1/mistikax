"use client";

import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";

export function MediaUploadButton() {
  return (
    <Button
      type="button"
      onClick={() =>
        toast.info(
          "La subida de imágenes se habilitará cuando los medios estén conectados (Fase 4).",
        )
      }
    >
      <Icon icon="lucide:upload" width={14} height={14} aria-hidden="true" />
      Subir imagen
    </Button>
  );
}
