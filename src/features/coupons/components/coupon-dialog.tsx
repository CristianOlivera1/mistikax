"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Icon } from "@/components/icons/icon";
import { FormField } from "@/components/shared/form-field";
import { SwitchField } from "@/components/shared/switch-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STORE } from "@/lib/constants";
import { createCouponAction, updateCouponAction } from "../actions";
import { couponFormSchema, type CouponFormValues } from "../schema";
import type { AdminCoupon } from "../types";

type CouponDialogProps = {
  coupon?: AdminCoupon;
};

function getDefaultValues(coupon: AdminCoupon | undefined): CouponFormValues {
  return {
    code: coupon?.code ?? "",
    kind: coupon?.kind ?? "percent",
    value:
      coupon === undefined
        ? 10
        : coupon.kind === "percent"
          ? coupon.value
          : coupon.value / 100,
    expiresAt: coupon?.expiresAt ?? "",
    active: coupon?.active ?? true,
    maxUses: coupon?.maxUses ?? 0,
  };
}

export function CouponDialog({ coupon }: CouponDialogProps) {
  const [open, setOpen] = useState(false);
  const defaultValues = getDefaultValues(coupon);
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const kind = useWatch({ control: form.control, name: "kind" });
  const active = useWatch({ control: form.control, name: "active" });
  const isPercent = kind === "percent";

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) form.reset(defaultValues);
  }

  async function onSubmit(values: CouponFormValues) {
    const result = coupon
      ? await updateCouponAction(coupon.code, values)
      : await createCouponAction(values);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(coupon ? "Descuento actualizado." : "Descuento creado.");
    setOpen(false);
    form.reset(defaultValues);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {coupon ? (
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
            Nuevo descuento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>
              {coupon ? "Editar descuento" : "Nuevo descuento"}
            </DialogTitle>
            <DialogDescription>
              Define el código, el beneficio y cuándo deja de estar disponible.
            </DialogDescription>
          </DialogHeader>

          <FormField
            label="Código"
            htmlFor="coupon-code"
            error={errors.code?.message}
            hint="Se mostrará en mayúsculas. Ejemplo: BIENVENIDO10."
          >
            <Input
              id="coupon-code"
              autoCapitalize="characters"
              placeholder="BIENVENIDO10"
              className="font-mono uppercase"
              disabled={Boolean(coupon)}
              aria-invalid={Boolean(errors.code)}
              {...form.register("code")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Tipo"
              htmlFor="coupon-kind"
              error={errors.kind?.message}
            >
              <Controller
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                  >
                    <SelectTrigger
                      id="coupon-kind"
                      aria-invalid={Boolean(errors.kind)}
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Porcentaje</SelectItem>
                      <SelectItem value="fixed">Monto fijo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label={
                isPercent ? "Porcentaje (%)" : `Monto (${STORE.currencySymbol})`
              }
              htmlFor="coupon-value"
              error={errors.value?.message}
            >
              <Input
                id="coupon-value"
                type="number"
                min={isPercent ? 1 : 0.01}
                step={isPercent ? 1 : 0.01}
                inputMode="decimal"
                aria-invalid={Boolean(errors.value)}
                {...form.register("value", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Vence"
            htmlFor="coupon-expires-at"
            error={errors.expiresAt?.message}
          >
            <Input
              id="coupon-expires-at"
              type="date"
              aria-invalid={Boolean(errors.expiresAt)}
              {...form.register("expiresAt")}
            />
          </FormField>

          <FormField
            label="Límite de usos"
            htmlFor="coupon-max-uses"
            error={errors.maxUses?.message}
            hint="0 = sin límite."
          >
            <Input
              id="coupon-max-uses"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              aria-invalid={Boolean(errors.maxUses)}
              {...form.register("maxUses", { valueAsNumber: true })}
            />
          </FormField>

          <SwitchField
            id="coupon-active"
            label="Descuento activo"
            description="Los códigos inactivos no se pueden aplicar en la tienda."
            checked={active}
            onCheckedChange={(checked) =>
              form.setValue("active", checked, { shouldValidate: true })
            }
          />

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
