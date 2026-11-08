"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CartLineView } from "@/features/cart/queries";
import { createOrderAction } from "@/features/checkout/actions";
import {
  CHECKOUT_PAYMENT_METHODS,
  checkoutSchema,
  type CheckoutInput,
  type CheckoutPaymentMethod,
} from "@/features/checkout/schema";
import {
  resolveShippingCents,
  SHIPPING_METHOD_LABELS,
  SHIPPING_ZONE_LABELS,
  type ShippingMethod,
  type ShippingZone,
} from "@/features/checkout/shipping";
import { formatMoney } from "@/lib/format";

type ShippingConfig = {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  courierEnabled: boolean;
  limaCents: number;
  limaOuterCents: number;
  provincesCents: number;
  storeAddress: string;
  leadTime: string;
};

type CheckoutFormProps = {
  paymentMethods: CheckoutPaymentMethod[];
  lines: CartLineView[];
  subtotalCents: number;
  freeShippingCents: number;
  shipping: ShippingConfig;
  customerName?: string;
  customerEmail?: string;
};

function enabledMethods(shipping: ShippingConfig): ShippingMethod[] {
  const methods: ShippingMethod[] = [];

  if (shipping.deliveryEnabled) methods.push("delivery");
  if (shipping.pickupEnabled) methods.push("pickup");
  if (shipping.courierEnabled) methods.push("courier");

  return methods;
}

export function CheckoutForm({
  paymentMethods,
  lines,
  subtotalCents,
  freeShippingCents,
  shipping,
  customerName = "",
  customerEmail = "",
}: CheckoutFormProps) {
  const router = useRouter();
  const formId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const methods = enabledMethods(shipping);
  const defaultMethod = methods[0] ?? "delivery";
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName,
      email: customerEmail,
      phone: "",
      city: "",
      address: "",
      note: "",
      paymentMethod: paymentMethods[0] ?? "transfer",
      shippingMethod: defaultMethod,
      shippingZone: defaultMethod === "courier" ? "provinces" : "lima",
      couponCode: "",
      idempotencyKey: formId,
    },
  });

  const method = useWatch({ control, name: "shippingMethod" }) ?? defaultMethod;
  const watchedZone = useWatch({ control, name: "shippingZone" });
  const zone: ShippingZone =
    method === "courier"
      ? "provinces"
      : method === "pickup"
        ? "lima"
        : watchedZone === "lima-outer"
          ? "lima-outer"
          : "lima";
  const rates = {
    shippingLimaCents: shipping.limaCents,
    shippingLimaOuterCents: shipping.limaOuterCents,
    shippingProvincesCents: shipping.provincesCents,
    freeShippingCents,
    deliveryEnabled: shipping.deliveryEnabled,
    pickupEnabled: shipping.pickupEnabled,
    courierEnabled: shipping.courierEnabled,
  };
  const shippingCents = resolveShippingCents({
    method,
    zone,
    subtotalCents,
    settings: rates,
  });
  const totalCents = subtotalCents + shippingCents;
  const isPickup = method === "pickup";
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingCents - subtotalCents,
  );

  function onSubmit(values: CheckoutInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createOrderAction(values);

      if (result.status === "error") {
        setServerError(result.message);

        for (const [field, message] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          setError(field as keyof CheckoutInput, { message });
        }

        return;
      }

      router.push(
        `/checkout/success?order=${encodeURIComponent(result.orderId)}&number=${result.number}&token=${encodeURIComponent(result.token)}`,
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-12 lg:grid-cols-[1fr_380px]"
      noValidate
    >
      <input type="hidden" {...register("idempotencyKey")} />
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Nombre completo</Label>
            <Input
              id="customerName"
              autoComplete="name"
              {...register("customerName")}
            />
            {errors.customerName ? (
              <p className="text-error text-xs">
                {errors.customerName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-error text-xs">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="text-error text-xs">{errors.phone.message}</p>
            ) : null}
          </div>
          {isPickup ? null : (
            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                autoComplete="address-level2"
                {...register("city")}
              />
              {errors.city ? (
                <p className="text-error text-xs">{errors.city.message}</p>
              ) : null}
            </div>
          )}
        </div>

        {isPickup ? null : (
          <div className="space-y-1.5">
            <Label htmlFor="address">Dirección de entrega</Label>
            <Input
              id="address"
              autoComplete="street-address"
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-error text-xs">{errors.address.message}</p>
            ) : null}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="note">Nota para el pedido (opcional)</Label>
          <textarea
            id="note"
            rows={3}
            className="border-grey-light focus:border-dark w-full border bg-white px-3 py-2 text-sm outline-none"
            {...register("note")}
          />
          {errors.note ? (
            <p className="text-error text-xs">{errors.note.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="couponCode">Código de descuento (opcional)</Label>
          <Input
            id="couponCode"
            placeholder="Ej: BIENVENIDO10"
            autoCapitalize="characters"
            {...register("couponCode")}
          />
          {errors.couponCode ? (
            <p className="text-error text-xs">{errors.couponCode.message}</p>
          ) : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-bold tracking-widest uppercase">
            Entrega
          </legend>
          {methods.length === 0 ? (
            <p role="alert" className="text-error text-sm">
              No hay métodos de entrega activos. Escríbenos por WhatsApp para
              coordinar tu pedido.
            </p>
          ) : null}
          {methods.map((option) => {
            const optionZone: ShippingZone =
              option === "courier" ? "provinces" : "lima";
            const cost = resolveShippingCents({
              method: option,
              zone: optionZone,
              subtotalCents,
              settings: rates,
            });
            const priceLabel =
              cost === 0
                ? "Gratis"
                : option === "delivery" &&
                    shipping.limaOuterCents !== shipping.limaCents
                  ? `Desde ${formatMoney(cost)}`
                  : formatMoney(cost);

            return (
              <label
                key={option}
                className="border-grey-light hover:border-grey-mid flex cursor-pointer items-center justify-between gap-3 border p-3 text-sm transition-colors"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    value={option}
                    {...register("shippingMethod")}
                  />
                  <span>
                    <span className="block font-medium">
                      {SHIPPING_METHOD_LABELS[option]}
                    </span>
                    <span className="text-grey-dark block text-[11px]">
                      {option === "delivery"
                        ? "Lima Metropolitana y periférica"
                        : option === "pickup"
                          ? `Retiro en ${shipping.storeAddress}`
                          : "Envío nacional por agencia"}
                    </span>
                  </span>
                </span>
                <span className="font-semibold">{priceLabel}</span>
              </label>
            );
          })}
          {errors.shippingMethod ? (
            <p className="text-error text-xs">
              {errors.shippingMethod.message}
            </p>
          ) : null}

          {method === "delivery" ? (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="shippingZone">Zona de delivery</Label>
              <Controller
                control={control}
                name="shippingZone"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                  >
                    <SelectTrigger
                      id="shippingZone"
                      onBlur={field.onBlur}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lima">
                        {SHIPPING_ZONE_LABELS.lima} ·{" "}
                        {formatMoney(shipping.limaCents)}
                      </SelectItem>
                      <SelectItem value="lima-outer">
                        {SHIPPING_ZONE_LABELS["lima-outer"]} ·{" "}
                        {formatMoney(shipping.limaOuterCents)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shippingZone ? (
                <p className="text-error text-xs">
                  {errors.shippingZone.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {method === "courier" ? (
            <p className="text-grey-dark text-xs">
              {SHIPPING_ZONE_LABELS.provinces} ·{" "}
              {formatMoney(shipping.provincesCents)}. Preparamos el pedido en{" "}
              {shipping.leadTime}.
            </p>
          ) : null}

          {isPickup ? (
            <p className="text-grey-dark text-xs">
              Recoges en {shipping.storeAddress}. Te avisamos por WhatsApp
              cuando el pedido esté listo.
            </p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-bold tracking-widest uppercase">
            Método de pago
          </legend>
          {paymentMethods.map((paymentMethod) => (
            <label
              key={paymentMethod}
              className="border-grey-light hover:border-grey-mid flex cursor-pointer items-center gap-3 border p-3 text-sm transition-colors"
            >
              <input
                type="radio"
                value={paymentMethod}
                {...register("paymentMethod")}
              />
              {CHECKOUT_PAYMENT_METHODS[paymentMethod]}
            </label>
          ))}
          {errors.paymentMethod ? (
            <p className="text-error text-xs">{errors.paymentMethod.message}</p>
          ) : null}
        </fieldset>

        {serverError ? (
          <p
            role="alert"
            className="text-error border-error/30 bg-error/5 border p-3 text-sm"
          >
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending || methods.length === 0}
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite h-12 w-full rounded-none text-xs font-bold tracking-widest uppercase"
        >
          {pending ? "Registrando pedido…" : "Confirmar pedido"}
        </Button>
        <p className="text-grey-dark text-center text-[11px]">
          Al confirmar recibirás el resumen y el enlace de WhatsApp para
          coordinar el pago y la entrega.
        </p>
      </div>

      <aside className="border-grey-light h-fit border p-6">
        <h2 className="font-heading mb-4 text-xl tracking-widest uppercase">
          Tu pedido
        </h2>
        <ul className="divide-grey-light mb-4 divide-y">
          {lines.map((line) => (
            <li
              key={line.key}
              className="flex items-start justify-between gap-3 py-3 text-sm"
            >
              <span>
                {line.qty} × {line.name}
                <span className="text-grey-dark block text-[11px] uppercase">
                  Talla {line.size}
                  {line.colorName ? ` · ${line.colorName}` : ""}
                </span>
              </span>
              <span className="font-semibold">
                {formatMoney(line.priceCents * line.qty)}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-grey-dark">Subtotal</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-grey-dark">Envío</span>
            <span>
              {shippingCents === 0 ? "Gratis" : formatMoney(shippingCents)}
            </span>
          </div>
          <div className="border-grey-light flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
          {remainingForFreeShipping > 0 && method !== "pickup" ? (
            <p className="text-grey-dark text-[11px] leading-relaxed">
              Te faltan {formatMoney(remainingForFreeShipping)} para el envío
              gratis.
            </p>
          ) : null}
        </div>

        <Link
          href="/shipping"
          className="text-grey-dark hover:text-dark mt-5 block text-[11px] tracking-widest uppercase underline underline-offset-4"
        >
          Ver formas de envío y tarifario
        </Link>

        {paymentMethods.length === 0 ? (
          <p role="alert" className="text-error mt-4 text-xs">
            No hay métodos de pago activos. Escríbenos por WhatsApp para
            coordinar tu pedido.
          </p>
        ) : null}
      </aside>
    </form>
  );
}
