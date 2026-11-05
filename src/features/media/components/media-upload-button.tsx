"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { uploadMediaAction } from "../actions";

export function MediaUploadButton() {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function triggerUpload() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const input = event.target;

    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadMediaAction(formData);

      if (result.status === "error") {
        toast.error(result.message);
        input.value = "";
        return;
      }

      toast.success("Imagen subida.");
      input.value = "";
    });
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        hidden
        onChange={handleFileChange}
        aria-label="Subir imagen"
      />
      <Button
        type="button"
        disabled={isPending}
        onClick={triggerUpload}
      >
        <Icon icon="lucide:upload" width={14} height={14} aria-hidden="true" />
        {isPending ? "Subiendo..." : "Subir imagen"}
      </Button>
    </>
  );
}
