"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { SwitchField } from "@/components/shared/switch-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "../types";
import { paymentSettingsSchema, type PaymentSettingsValues } from "../schema";

type PaymentSettingsFormProps = {
  settings: SiteSettings;
};

export function PaymentSettingsForm({ settings }: PaymentSettingsFormProps) {
  const form = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      paymentCard: settings.paymentCard,
      paymentTransfer: settings.paymentTransfer,
      paymentCod: settings.paymentCod,
      paymentWallet: settings.paymentWallet,
      transferInstructions: settings.transferInstructions,
    },
  });
  const { errors } = form.formState;
  const paymentCard = useWatch({
    control: form.control,
    name: "paymentCard",
  });
  const paymentTransfer = useWatch({
    control: form.control,
    name: "paymentTransfer",
  });
  const paymentCod = useWatch({ control: form.control, name: "paymentCod" });
  const paymentWallet = useWatch({
    control: form.control,
    name: "paymentWallet",
  });

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
      <SectionCard title="Pagos" bodyClassName="space-y-3 p-5">
        <SwitchField
          id="payment-card"
          label="Tarjeta de crédito o débito"
          checked={paymentCard}
          onCheckedChange={(checked) =>
            form.setValue("paymentCard", checked, { shouldValidate: true })
          }
        />
        <SwitchField
          id="payment-transfer"
          label="Transferencia bancaria"
          checked={paymentTransfer}
          onCheckedChange={(checked) =>
            form.setValue("paymentTransfer", checked, { shouldValidate: true })
          }
        />
        <SwitchField
          id="payment-cod"
          label="Pago contra entrega"
          checked={paymentCod}
          onCheckedChange={(checked) =>
            form.setValue("paymentCod", checked, { shouldValidate: true })
          }
        />
        <SwitchField
          id="payment-wallet"
          label="Billeteras digitales"
          description="Yape, Plin u otras."
          checked={paymentWallet}
          onCheckedChange={(checked) =>
            form.setValue("paymentWallet", checked, { shouldValidate: true })
          }
        />

        <FormField
          label="Instrucciones de transferencia"
          htmlFor="settings-transfer-instructions"
          error={errors.transferInstructions?.message}
        >
          <Textarea
            id="settings-transfer-instructions"
            rows={3}
            aria-invalid={Boolean(errors.transferInstructions)}
            {...form.register("transferInstructions")}
          />
        </FormField>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
