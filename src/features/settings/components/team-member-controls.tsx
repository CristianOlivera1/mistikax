"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, type Role } from "@/lib/constants";
import { updateTeamMemberAction } from "../actions";
import type { TeamMember } from "../types";

type TeamMemberControlProps = {
  member: TeamMember;
  isSelf: boolean;
};

export function TeamMemberRole({ member, isSelf }: TeamMemberControlProps) {
  const [role, setRole] = useState<Role>(member.role);
  const [pending, startTransition] = useTransition();

  function changeRole(nextRole: string) {
    if (nextRole !== "admin" && nextRole !== "editor") return;

    const previous = role;
    setRole(nextRole);

    startTransition(async () => {
      const result = await updateTeamMemberAction({
        id: member.id,
        role: nextRole,
        active: member.active,
      });

      if (result.status === "error") {
        setRole(previous);
        toast.error(result.message);
        return;
      }

      toast.success("Rol actualizado.");
    });
  }

  return (
    <Select
      value={role}
      onValueChange={changeRole}
      disabled={isSelf || pending}
    >
      <SelectTrigger
        size="sm"
        aria-label={`Rol de ${member.name}`}
        className="w-32"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">{ROLES.admin}</SelectItem>
        <SelectItem value="editor">{ROLES.editor}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function TeamMemberAccess({ member, isSelf }: TeamMemberControlProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function setActive(active: boolean) {
    startTransition(async () => {
      const result = await updateTeamMemberAction({
        id: member.id,
        role: member.role,
        active,
      });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(active ? "Acceso reactivado." : "Acceso desactivado.");
    });
  }

  if (!member.active) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => setActive(true)}
      >
        Activar
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={isSelf || pending}
        onClick={() => setConfirmOpen(true)}
      >
        Desactivar
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Desactivar acceso"
        description={`${member.name} no podrá entrar al panel hasta que reactives su acceso.`}
        confirmLabel="Desactivar"
        tone="danger"
        onConfirm={async () => {
          const result = await updateTeamMemberAction({
            id: member.id,
            role: member.role,
            active: false,
          });

          if (result.status === "error") {
            toast.error(result.message);
            return;
          }

          toast.success("Acceso desactivado.");
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
