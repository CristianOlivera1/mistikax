"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderNoteAction } from "../actions";

type OrderNoteFormProps = {
  orderId: string;
  note: string;
};

export function OrderNoteForm({ orderId, note }: OrderNoteFormProps) {
  const [currentNote, setCurrentNote] = useState(note);

  if (note) {
    return <p className="text-sm whitespace-pre-wrap">{note}</p>;
  }

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const value = currentNote.trim();

        if (!value) return;

        const result = await updateOrderNoteAction(orderId, value);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success("Nota guardada.");
      }}
    >
      <Textarea
        rows={3}
        placeholder="Escribe una nota interna sobre este pedido..."
        value={currentNote}
        onChange={(event) => setCurrentNote(event.target.value)}
        aria-label="Nota interna del pedido"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!currentNote.trim()}>
          Guardar nota
        </Button>
      </div>
    </form>
  );
}
