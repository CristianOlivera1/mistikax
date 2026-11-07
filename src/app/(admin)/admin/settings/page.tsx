import type { Metadata } from "next";
import { Icon } from "@/components/icons/icon";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

async function SettingsContent({ tab }: { tab: SettingsTab }) {
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

  if (tab === "team") {
    return (
      <div className="space-y-4">
        <SectionCard
          title="Miembros"
          description="La gestión de equipo se habilitará en la Fase 6."
          action={
            <Button
              type="button"
              disabled
              title="Las invitaciones se habilitarán en la Fase 6."
            >
              Invitar
            </Button>
          }
        >
          <TeamTable members={getTeam()} />
        </SectionCard>
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">Roles:</strong> Administrador
          (todo) · Editor (catálogo y contenido).
        </p>
      </div>
    );
  }

  return <GeneralSettingsForm settings={settings} />;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const params = await searchParams;
  const tab = parseSettingsTab(params.tab);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Configuración"
        description="Ajustes generales de la tienda."
      />
      <SettingsTabs active={tab} />
      <Alert className="bg-muted/40">
        <Icon icon="lucide:info" width={15} height={15} aria-hidden="true" />
        <AlertDescription>
          Vista previa de la configuración. El guardado se habilita en la Fase
          5; la gestión del equipo, en la Fase 6.
        </AlertDescription>
      </Alert>
      <div className="max-w-3xl">
        <SettingsContent tab={tab} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
