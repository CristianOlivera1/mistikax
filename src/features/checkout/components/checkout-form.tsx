"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrderAction } from "@/features/checkout/actions";
import {
  CHECKOUT_PAYMENT_METHODS,
  checkoutSchema,
  type CheckoutInput,
  type CheckoutPaymentMethod,
} from "@/features/checkout/schema";

type CheckoutFormProps = {
  paymentMethods: CheckoutPaymentMethod[];
  customerName?: string;
};

export function CheckoutForm({ paymentMethods, customerName = "" }: CheckoutFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName,
      email: "",
      phone: "",
      city: "",
      address: "",
      note: "",
      paymentMethod: paymentMethods[0] ?? "transfer",
    },
  });

  function onSubmit(values: CheckoutInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createOrderAction(values);

      if (result.status === "error") {
        setServerError(result.message);

        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customerName">Nombre completo</Label>
          <Input id="customerName" autoComplete="name" {...register("customerName")} />
          {errors.customerName ? (
            <p className="text-error text-xs">{errors.customerName.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email ? (
            <p className="text-error text-xs">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono / WhatsApp</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          {errors.phone ? (
            <p className="text-error text-xs">{errors.phone.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" autoComplete="address-level2" {...register("city")} />
          {errors.city ? (
            <p className="text-error text-xs">{errors.city.message}</p>
          ) : null}
        </div>
      </div>

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

      <fieldset className="space-y-2">
        <legend className="mb-2 text-xs font-bold tracking-widest uppercase">
          Método de pago
        </legend>
        {paymentMethods.map((method) => (
          <label
            key={method}
            className="border-grey-light hover:border-grey-mid flex cursor-pointer items-center gap-3 border p-3 text-sm transition-colors"
          >
            <input type="radio" value={method} {...register("paymentMethod")} />
            {CHECKOUT_PAYMENT_METHODS[method]}
          </label>
        ))}
        {errors.paymentMethod ? (
          <p className="text-error text-xs">{errors.paymentMethod.message}</p>
        ) : null}
      </fieldset>

      {serverError ? (
        <p role="alert" className="text-error border-error/30 bg-error/5 border p-3 text-sm">
          {serverError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite h-12 w-full rounded-none text-xs font-bold tracking-widest uppercase"
      >
        {pending ? "Registrando pedido…" : "Confirmar pedido"}
      </Button>
      <p className="text-grey-dark text-center text-[11px]">
        Al confirmar recibirás el resumen y el enlace de WhatsApp para coordinar
        el pago y la entrega.
      </p>
    </form>
  );
}
