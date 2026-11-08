"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORE } from "@/lib/constants";
import { updateShippingSettingsAction } from "../actions";
import type { SiteSettings } from "../types";
import { shippingSettingsSchema, type ShippingSettingsValues } from "../schema";

type ShippingSettingsFormProps = {
  settings: SiteSettings;
};

export function ShippingSettingsForm({ settings }: ShippingSettingsFormProps) {
  const form = useForm<ShippingSettingsValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      deliveryLima: settings.shippingLimaCents / 100,
      deliveryLimaOuter: settings.shippingLimaOuterCents / 100,
      courierProvinces: settings.shippingProvincesCents / 100,
      freeShippingFrom: settings.freeShippingCents / 100,
      leadTime: settings.leadTime,
      deliveryEnabled: settings.deliveryEnabled,
      pickupEnabled: settings.pickupEnabled,
      courierEnabled: settings.courierEnabled,
    },
  });
  const { errors } = form.formState;
  const deliveryEnabled = useWatch({
    control: form.control,
    name: "deliveryEnabled",
  });
  const pickupEnabled = useWatch({
    control: form.control,
    name: "pickupEnabled",
  });
  const courierEnabled = useWatch({
    control: form.control,
    name: "courierEnabled",
  });

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        const result = await updateShippingSettingsAction(values);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success("Configuración de envíos guardada.");
        form.reset(values);
      })}
      noValidate
      className="space-y-4"
    >
      <SectionCard
        title="Tarifario"
        description="Precios por zona. El envío gratis se aplica sobre el subtotal."
        bodyClassName="space-y-4 p-5"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label={`Lima Metropolitana (${STORE.currencySymbol})`}
            htmlFor="settings-shipping-lima"
            error={errors.deliveryLima?.message}
          >
            <Input
              id="settings-shipping-lima"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.deliveryLima)}
              {...form.register("deliveryLima", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label={`Lima periférica (${STORE.currencySymbol})`}
            htmlFor="settings-shipping-lima-outer"
            error={errors.deliveryLimaOuter?.message}
          >
            <Input
              id="settings-shipping-lima-outer"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.deliveryLimaOuter)}
              {...form.register("deliveryLimaOuter", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label={`Provincias (${STORE.currencySymbol})`}
            htmlFor="settings-shipping-provinces"
            error={errors.courierProvinces?.message}
          >
            <Input
              id="settings-shipping-provinces"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              aria-invalid={Boolean(errors.courierProvinces)}
              {...form.register("courierProvinces", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </SectionCard>

      <SectionCard
        title="Métodos disponibles"
        description="Si desactivas un método, deja de ofrecerse en el checkout."
        bodyClassName="space-y-3 p-5"
      >
        {errors.deliveryEnabled?.message ? (
          <p className="text-destructive text-xs" role="alert">
            {errors.deliveryEnabled.message}
          </p>
        ) : null}

        <div className="flex items-start gap-3">
          <Checkbox
            id="settings-delivery-enabled"
            checked={deliveryEnabled}
            onCheckedChange={(checked) =>
              form.setValue("deliveryEnabled", checked === true, {
                shouldValidate: true,
              })
            }
          />
          <div>
            <Label htmlFor="settings-delivery-enabled">
              Delivery a domicilio
            </Label>
            <p className="text-muted-foreground text-xs">
              Lima Metropolitana y Lima periférica.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="settings-pickup-enabled"
            checked={pickupEnabled}
            onCheckedChange={(checked) =>
              form.setValue("pickupEnabled", checked === true, {
                shouldValidate: true,
              })
            }
          />
          <div>
            <Label htmlFor="settings-pickup-enabled">Recojo en tienda</Label>
            <p className="text-muted-foreground text-xs">
              Sin costo, en la dirección configurada en General.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="settings-courier-enabled"
            checked={courierEnabled}
            onCheckedChange={(checked) =>
              form.setValue("courierEnabled", checked === true, {
                shouldValidate: true,
              })
            }
          />
          <div>
            <Label htmlFor="settings-courier-enabled">
              Courier a provincias
            </Label>
            <p className="text-muted-foreground text-xs">
              Envío nacional por agencia.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
