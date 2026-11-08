import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/features/customer-auth/components/customer-auth-form";
import { getCustomerSession } from "@/features/customer-auth/queries";

export const metadata: Metadata = {
  title: "Entrar a mi cuenta",
};

export const dynamic = "force-dynamic";

type CustomerSignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerSignInPage({
  searchParams,
}: CustomerSignInPageProps) {
  const session = await getCustomerSession();

  if (session) redirect("/account");

  const params = await searchParams;
  const hasOAuthError = params.error === "oauth";

  return (
    <div className="mx-auto max-w-md px-6 py-16 sm:py-20">
      <p className="text-grey-dark text-[11px] font-medium tracking-[0.22em] uppercase">
        Mi cuenta
      </p>
      <h1 className="text-dark mt-3 text-3xl font-light tracking-tight sm:text-4xl">
        Entra a tu cuenta
      </h1>
      <p className="text-grey-dark mt-3 text-sm leading-relaxed">
        Guarda tus datos y revisa tus compras más rápido. Puedes entrar con
        Google o con tu correo.
      </p>

      {hasOAuthError ? (
        <p
          role="alert"
          className="text-error mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm"
        >
          No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu
          correo y contraseña.
        </p>
      ) : null}

      <div className="border-grey-light mt-8 border bg-white p-6 sm:p-8">
        <CustomerAuthForm mode="sign-in" />
      </div>
    </div>
  );
}
