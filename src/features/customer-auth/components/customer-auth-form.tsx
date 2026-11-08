"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  signInCustomerAction,
  signInWithGoogleAction,
  signUpCustomerAction,
} from "../actions";

type CustomerAuthFormProps = {
  mode: "sign-in" | "sign-up";
};

const inputClass =
  "border-dark text-dark w-full border bg-white p-3 text-sm transition-colors focus:ring-dark focus:ring-1 focus:outline-none";
const labelClass =
  "text-grey-dark text-[11px] font-medium tracking-[0.18em] uppercase";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function CustomerAuthForm({ mode }: CustomerAuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";

  function onGoogleClick() {
    setMessage(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await signInWithGoogleAction();

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      window.location.assign(result.url);
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSuccess(null);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    startTransition(async () => {
      const result = isSignUp
        ? await signUpCustomerAction({
            fullName: String(data.get("fullName") ?? ""),
            email,
            password,
          })
        : await signInCustomerAction({ email, password });

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      if (result.needsConfirmation) {
        setSuccess(
          "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja.",
        );
        return;
      }

      router.replace("/account");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isPending}
        className="border-dark hover:bg-dark hover:text-offwhite flex w-full items-center justify-center gap-3 border px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <div className="flex items-center gap-3">
        <span className="bg-grey-light h-px flex-1" aria-hidden="true" />
        <span className="text-grey-dark text-[11px] tracking-widest uppercase">
          o con tu correo
        </span>
        <span className="bg-grey-light h-px flex-1" aria-hidden="true" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {isSignUp ? (
          <div className="space-y-1.5">
            <label htmlFor="fullName" className={labelClass}>
              Nombre
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              className={inputClass}
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClass}>
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        {message ? (
          <p role="alert" className="text-destructive text-sm">
            {message}
          </p>
        ) : null}

        {success ? (
          <p role="status" className="text-dark text-sm">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="bg-dark hover:bg-premium hover:text-dark w-full px-6 py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-colors disabled:opacity-50"
        >
          {isPending
            ? "Procesando…"
            : isSignUp
              ? "Crear cuenta"
              : "Entrar"}
        </button>
      </form>

      <p className="text-grey-dark text-center text-sm">
        {isSignUp ? "¿Ya tienes cuenta?" : "¿Todavía no tienes cuenta?"}{" "}
        <Link
          href={isSignUp ? "/account/sign-in" : "/account/sign-up"}
          className="text-dark font-medium underline underline-offset-4"
        >
          {isSignUp ? "Entra aquí" : "Créala aquí"}
        </Link>
      </p>
    </div>
  );
}
