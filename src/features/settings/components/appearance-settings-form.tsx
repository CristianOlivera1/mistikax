"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SiteSettings } from "../types";
import {
  appearanceSettingsSchema,
  type AppearanceSettingsValues,
} from "../schema";

type AppearanceSettingsFormProps = {
  settings: SiteSettings;
};

export function AppearanceSettingsForm({
  settings,
}: AppearanceSettingsFormProps) {
  const form = useForm<AppearanceSettingsValues>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      primaryColor: settings.primaryColor,
      accentColor: settings.accentColor,
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
      <SectionCard title="Apariencia" bodyClassName="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Color principal"
            htmlFor="settings-primary-color"
            error={errors.primaryColor?.message}
          >
            <div className="flex gap-2">
              <Input
                id="settings-primary-color"
                type="color"
                className="h-9 w-14 cursor-pointer p-1"
                {...form.register("primaryColor")}
              />
              <Input
                className="font-mono"
                aria-label="Valor del color principal"
                {...form.register("primaryColor")}
              />
            </div>
          </FormField>

          <FormField
            label="Color de acento"
            htmlFor="settings-accent-color"
            error={errors.accentColor?.message}
          >
            <div className="flex gap-2">
              <Input
                id="settings-accent-color"
                type="color"
                className="h-9 w-14 cursor-pointer p-1"
                {...form.register("accentColor")}
              />
              <Input
                className="font-mono"
                aria-label="Valor del color de acento"
                {...form.register("accentColor")}
              />
            </div>
          </FormField>
        </div>

        <p className="text-muted-foreground text-xs">
          Estos colores se aplican a botones y fondos de la tienda.
        </p>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
