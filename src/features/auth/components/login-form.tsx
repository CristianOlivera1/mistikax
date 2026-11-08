"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Icon } from "@/components/icons/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginValues } from "../schema";
import { signInAction } from "../actions";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { errors } = form.formState;

  const onSubmit = (values: LoginValues) => {
    setStatusMessage(null);

    startTransition(async () => {
      const result = await signInAction(values);

      if (!result.ok) {
        setStatusMessage(result.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Icon
            icon="lucide:mail"
            width={15}
            height={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nombre@mistikax.com"
            className="h-10 pl-9"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...form.register("email")}
          />
        </div>
        {errors.email ? (
          <p id="email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Contraseña</Label>
          <span className="text-[11px] text-muted-foreground">Mínimo 8 caracteres</span>
        </div>
        <div className="relative">
          <Icon
            icon="lucide:lock"
            width={15}
            height={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            className="h-10 pr-10 pl-9"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Icon
              icon={showPassword ? "lucide:eye-off" : "lucide:eye"}
              width={16}
              height={16}
              aria-hidden="true"
            />
          </Button>
        </div>
        {errors.password ? (
          <p id="password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end">
        <a
          href="mailto:hola@mistikax.com?subject=Ayuda%20para%20entrar%20al%20panel%20Mistikax"
          className="text-[13px] font-medium underline-offset-4 hover:underline"
        >
          ¿Necesitas ayuda para entrar?
        </a>
      </div>

      <Button type="submit" className="h-10 w-full" disabled={isPending}>
        {isPending ? "Ingresando…" : "Ingresar al panel"}
        <Icon icon="lucide:arrow-right" width={15} height={15} aria-hidden="true" />
      </Button>

      {statusMessage ? (
        <Alert id="login-status" role="status" aria-live="polite" className="bg-muted/60">
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
