import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/features/customer-auth/components/customer-auth-form";
import { getCustomerSession } from "@/features/customer-auth/queries";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export const dynamic = "force-dynamic";

export default async function CustomerSignUpPage() {
  const session = await getCustomerSession();

  if (session) redirect("/account");

  return (
    <div className="mx-auto max-w-md px-6 py-16 sm:py-20">
      <p className="text-grey-dark text-[11px] font-medium tracking-[0.22em] uppercase">
        Mi cuenta
      </p>
      <h1 className="text-dark mt-3 text-3xl font-light tracking-tight sm:text-4xl">
        Crea tu cuenta
      </h1>
      <p className="text-grey-dark mt-3 text-sm leading-relaxed">
        Regístrate con Google o con tu correo para guardar tus datos de compra.
      </p>

      <div className="border-grey-light mt-8 border bg-white p-6 sm:p-8">
        <CustomerAuthForm mode="sign-up" />
      </div>
    </div>
  );
}
