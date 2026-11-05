"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORE } from "@/lib/constants";
import type { SiteSettings } from "../types";
import { shippingSettingsSchema, type ShippingSettingsValues } from "../schema";

type ShippingSettingsFormProps = {
  settings: SiteSettings;
};

export function ShippingSettingsForm({ settings }: ShippingSettingsFormProps) {
  const form = useForm<ShippingSettingsValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      shippingCost: settings.shippingCents / 100,
      freeShippingFrom: settings.freeShippingCents / 100,
      leadTime: settings.leadTime,
    },
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(() =>
        toast.info(
          "La configuración está validada. El guardado se habilitará en la Fase 5.",
        ),
      )}
      noValidate
      className="space-y-4"
    >
      <SectionCard title="Envíos" bodyClassName="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={`Costo de envío (${STORE.currencySymbol})`}
            htmlFor="settings-shipping-cost"
            error={errors.shippingCost?.message}
          >
            <Input
              id="settings-shipping-cost"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.shippingCost)}
              {...form.register("shippingCost", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label={`Envío gratis desde (${STORE.currencySymbol})`}
            htmlFor="settings-free-shipping"
            error={errors.freeShippingFrom?.message}
          >
            <Input
              id="settings-free-shipping"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.freeShippingFrom)}
              {...form.register("freeShippingFrom", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <FormField
          label="Tiempo de preparación"
          htmlFor="settings-lead-time"
          error={errors.leadTime?.message}
        >
          <Input
            id="settings-lead-time"
            placeholder="24-48 horas"
            aria-invalid={Boolean(errors.leadTime)}
            {...form.register("leadTime")}
          />
        </FormField>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
