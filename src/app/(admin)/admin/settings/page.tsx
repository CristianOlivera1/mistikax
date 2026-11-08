import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/features/auth/queries";
import { AppearanceSettingsForm } from "@/features/settings/components/appearance-settings-form";
import { GeneralSettingsForm } from "@/features/settings/components/general-settings-form";
import { PaymentSettingsForm } from "@/features/settings/components/payment-settings-form";
import { SettingsTabs } from "@/features/settings/components/settings-tabs";
import { ShippingSettingsForm } from "@/features/settings/components/shipping-settings-form";
import { TeamTable } from "@/features/settings/components/team-table";
import {
  getSiteSettings,
  getTeam,
  parseSettingsTab,
} from "@/features/settings/queries";
import type { SettingsTab } from "@/features/settings/types";

export const metadata: Metadata = {
  title: "Configuración",
};

type SettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SettingsContentProps = {
  tab: SettingsTab;
  currentUserId: string;
};

async function SettingsContent({ tab, currentUserId }: SettingsContentProps) {
  if (tab === "team") {
    const members = await getTeam();

    return (
      <div className="space-y-4">
        <SectionCard
          title="Miembros"
          description="Administradores y editores con acceso al panel."
          action={
            <Button
              type="button"
              disabled
              title="Configura SMTP en Supabase para enviar invitaciones."
            >
              Invitar
            </Button>
          }
        >
          {members.length === 0 ? (
            <p className="text-muted-foreground p-5 text-sm">
              Aún no hay cuentas. Crea la primera en Supabase Authentication:
              entrará como administrador.
            </p>
          ) : (
            <TeamTable members={members} currentUserId={currentUserId} />
          )}
        </SectionCard>
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">Roles:</strong> Administrador
          (todo) · Editor (catálogo y contenido).
        </p>
      </div>
    );
  }

  const settings = await getSiteSettings();

  if (tab === "shipping") {
    return <ShippingSettingsForm settings={settings} />;
  }

  if (tab === "payments") {
    return <PaymentSettingsForm settings={settings} />;
  }

  if (tab === "appearance") {
    return <AppearanceSettingsForm settings={settings} />;
  }

  return <GeneralSettingsForm settings={settings} />;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const params = await searchParams;
  const tab = parseSettingsTab(params.tab);
  const session = await getAdminSession();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Configuración"
        description="Ajustes generales de la tienda."
      />
      <SettingsTabs active={tab} />
      <div className="max-w-3xl">
        <SettingsContent tab={tab} currentUserId={session?.id ?? ""} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
