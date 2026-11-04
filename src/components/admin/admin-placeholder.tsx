import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

type AdminPlaceholderProps = {
  title: string;
  description: string;
  phase: string;
  icon?: string;
};

export function AdminPlaceholder({
  title,
  description,
  phase,
  icon,
}: AdminPlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="border-border bg-card mt-4 rounded-lg border">
        <EmptyState
          icon={icon}
          title="Sección en construcción"
          description={`La interfaz completa llega en la ${phase}. La navegación del panel ya está disponible.`}
        />
      </div>
    </div>
  );
}
