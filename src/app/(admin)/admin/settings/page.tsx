import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function SettingsPage() {
  return (
    <AdminPlaceholder
      title="Configuración"
      description="Ajustes generales, envíos, pagos, equipo y apariencia."
      phase="Fase 3"
      icon="lucide:settings"
    />
  );
}
