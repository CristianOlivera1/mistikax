import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROLES } from "@/lib/constants";
import type { TeamMember } from "../types";

type TeamTableProps = {
  members: TeamMember[];
};

export function TeamTable({ members }: TeamTableProps) {
  const columns: DataTableColumn<TeamMember>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: (member) => <span className="font-medium">{member.name}</span>,
    },
    {
      id: "email",
      header: "Correo",
      cell: (member) => (
        <span className="text-muted-foreground">{member.email}</span>
      ),
    },
    {
      id: "role",
      header: "Rol",
      cell: (member) => (
        <StatusBadge tone={member.role === "admin" ? "info" : "neutral"}>
          {ROLES[member.role]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={members}
      getRowKey={(member) => member.id}
    />
  );
}
