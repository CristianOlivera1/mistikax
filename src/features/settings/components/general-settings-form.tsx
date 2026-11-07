"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateGeneralSettingsAction } from "../actions";
import type { SiteSettings } from "../types";
import { generalSettingsSchema, type GeneralSettingsValues } from "../schema";

type GeneralSettingsFormProps = {
  settings: SiteSettings;
};

export function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      storeName: settings.storeName,
      description: settings.description,
      contactEmail: settings.contactEmail,
      whatsapp: settings.whatsapp,
      address: settings.address,
      stockThreshold: settings.stockThreshold,
    },
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        const result = await updateGeneralSettingsAction(values);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success("Configuración guardada.");
        form.reset(values);
      })}
      noValidate
      className="space-y-4"
    >
      <SectionCard title="Datos de la tienda" bodyClassName="space-y-4 p-5">
        <FormField
          label="Nombre de la tienda"
          htmlFor="settings-store-name"
          error={errors.storeName?.message}
        >
          <Input
            id="settings-store-name"
            aria-invalid={Boolean(errors.storeName)}
            {...form.register("storeName")}
          />
        </FormField>

        <FormField
          label="Descripción"
          htmlFor="settings-description"
          error={errors.description?.message}
        >
          <Textarea
            id="settings-description"
            rows={2}
            aria-invalid={Boolean(errors.description)}
            {...form.register("description")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Correo de contacto"
            htmlFor="settings-email"
            error={errors.contactEmail?.message}
          >
            <Input
              id="settings-email"
              type="email"
              aria-invalid={Boolean(errors.contactEmail)}
              {...form.register("contactEmail")}
            />
          </FormField>

          <FormField
            label="WhatsApp"
            htmlFor="settings-whatsapp"
            error={errors.whatsapp?.message}
            hint="Incluye el código de país."
          >
            <Input
              id="settings-whatsapp"
              inputMode="tel"
              aria-invalid={Boolean(errors.whatsapp)}
              {...form.register("whatsapp")}
            />
          </FormField>
        </div>

        <FormField
          label="Dirección"
          htmlFor="settings-address"
          error={errors.address?.message}
        >
          <Input
            id="settings-address"
            aria-invalid={Boolean(errors.address)}
            {...form.register("address")}
          />
        </FormField>

        <FormField
          label="Alerta de stock bajo (unidades por talla)"
          htmlFor="settings-stock-threshold"
          error={errors.stockThreshold?.message}
        >
          <Input
            id="settings-stock-threshold"
            type="number"
            min={1}
            inputMode="numeric"
            aria-invalid={Boolean(errors.stockThreshold)}
            {...form.register("stockThreshold", { valueAsNumber: true })}
          />
        </FormField>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
