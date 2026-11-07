"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { createFaqAction, updateFaqAction } from "../actions";
import { faqFormSchema, type FaqFormValues } from "../schema";
import type { FaqItem } from "../types";

type FaqDialogProps = {
  faq?: FaqItem;
};

function getDefaultValues(faq: FaqItem | undefined): FaqFormValues {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
  };
}

export function FaqDialog({ faq }: FaqDialogProps) {
  const [open, setOpen] = useState(false);
  const defaultValues = getDefaultValues(faq);
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues,
  });
  const { errors } = form.formState;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) form.reset(defaultValues);
  }

  async function onSubmit(values: FaqFormValues) {
    const result = faq
      ? await updateFaqAction(faq.id, values)
      : await createFaqAction(values);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(faq ? "Pregunta actualizada." : "Pregunta creada.");
    setOpen(false);
    form.reset(defaultValues);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {faq ? (
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
            Nueva pregunta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>
              {faq ? "Editar pregunta" : "Nueva pregunta"}
            </DialogTitle>
            <DialogDescription>
              Se mostrará en la sección de preguntas frecuentes de la portada.
            </DialogDescription>
          </DialogHeader>

          <FormField
            label="Pregunta"
            htmlFor="faq-question"
            error={errors.question?.message}
          >
            <Input
              id="faq-question"
              placeholder="¿Cómo elijo mi talla?"
              aria-invalid={Boolean(errors.question)}
              {...form.register("question")}
            />
          </FormField>

          <FormField
            label="Respuesta"
            htmlFor="faq-answer"
            error={errors.answer?.message}
          >
            <Textarea
              id="faq-answer"
              rows={4}
              aria-invalid={Boolean(errors.answer)}
              {...form.register("answer")}
            />
          </FormField>

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
