"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { FaqItem } from "../types";
import { FaqDialog } from "./faq-dialog";

type FaqListProps = {
  faqs: FaqItem[];
};

export function FaqList({ faqs }: FaqListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pendingDelete = faqs.find((faq) => faq.id === deleteId);

  if (faqs.length === 0) {
    return <EmptyState icon="lucide:info" title="Sin preguntas" />;
  }

  return (
    <>
      <div className="divide-border divide-y">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{faq.question}</p>
              <p className="text-muted-foreground mt-1 text-sm">{faq.answer}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Subir ${faq.question}`}
              disabled={index === 0}
              onClick={() => toast.info("El orden se guardará en la Fase 5.")}
            >
              <Icon
                icon="lucide:arrow-up"
                width={14}
                height={14}
                aria-hidden="true"
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Bajar ${faq.question}`}
              disabled={index === faqs.length - 1}
              onClick={() => toast.info("El orden se guardará en la Fase 5.")}
            >
              <Icon
                icon="lucide:arrow-down"
                width={14}
                height={14}
                aria-hidden="true"
              />
            </Button>
            <FaqDialog faq={faq} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteId(faq.id)}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar pregunta"
        description={`¿Eliminar "${pendingDelete?.question ?? "esta pregunta"}"? Esta acción se habilitará cuando las preguntas estén conectadas.`}
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={() => {
          setDeleteId(null);
          toast.info(
            "La eliminación se habilitará cuando las preguntas estén conectadas (Fase 5).",
          );
        }}
      />
    </>
  );
}
