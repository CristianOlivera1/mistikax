"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Icon } from "@/components/icons/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginValues } from "../schema";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });
  const { errors } = form.formState;

  const onSubmit = () => {
    setStatusMessage(
      "El acceso estará disponible cuando se active la autenticación del panel.",
    );
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="remember"
            render={({ field }) => (
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="remember" className="text-[13px] font-normal text-muted-foreground">
            Recordarme
          </Label>
        </div>
        <a
          href="mailto:hola@mistikax.com?subject=Acceso%20al%20panel%20Mistikax"
          className="text-[13px] font-medium underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button type="submit" className="h-10 w-full">
        Ingresar al panel
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
