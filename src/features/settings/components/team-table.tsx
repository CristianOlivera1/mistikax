import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { TeamMember } from "../types";
import { TeamMemberAccess, TeamMemberRole } from "./team-member-controls";

type TeamTableProps = {
  members: TeamMember[];
  currentUserId: string;
};

export function TeamTable({ members, currentUserId }: TeamTableProps) {
  const columns: DataTableColumn<TeamMember>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: (member) => (
        <span className="font-medium">
          {member.name}
          {member.id === currentUserId ? (
            <span className="text-muted-foreground"> (tú)</span>
          ) : null}
        </span>
      ),
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
        <TeamMemberRole
          member={member}
          isSelf={member.id === currentUserId}
        />
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (member) => (
        <StatusBadge tone={member.active ? "success" : "neutral"}>
          {member.active ? "Activo" : "Inactivo"}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (member) => (
        <div className="flex justify-end">
          <TeamMemberAccess
            member={member}
            isSelf={member.id === currentUserId}
          />
        </div>
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
