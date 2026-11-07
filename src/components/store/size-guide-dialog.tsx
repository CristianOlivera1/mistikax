"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CLOTHING_GUIDE, FOOTWEAR_GUIDE } from "@/features/catalog/size-guide";
import { AGE_GROUPS, type AgeGroup } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SizeGuideDialogProps = {
  age: AgeGroup;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function SizeGuideDialog({
  age,
  triggerClassName,
  triggerLabel = "Guía de tallas",
}: SizeGuideDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "border-grey-light hover:border-dark border-b text-xs font-bold tracking-widest uppercase transition-colors",
            triggerClassName,
          )}
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-wide uppercase">
            Guía de tallas
          </DialogTitle>
          <DialogDescription>
            Medidas del cuerpo en centímetros. Si estás entre dos tallas, elige
            la mayor.
          </DialogDescription>
        </DialogHeader>

        {CLOTHING_GUIDE.filter((group) => group.age === age).map((group) => (
          <div key={group.age} className="space-y-2">
            <h3 className="font-heading text-lg tracking-wide uppercase">
              {group.title}
            </h3>
            <table className="border-grey-light w-full border text-left text-xs">
              <thead className="bg-offwhite font-space-mono text-[10px] tracking-widest uppercase">
                <tr>
                  <th className="border-grey-light border p-2">Talla</th>
                  <th className="border-grey-light border p-2">Pecho</th>
                  <th className="border-grey-light border p-2">Cintura</th>
                  <th className="border-grey-light border p-2">Cadera</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.size}>
                    <td className="border-grey-light border p-2 font-semibold">
                      {row.size}
                    </td>
                    <td className="border-grey-light border p-2">{row.chest}</td>
                    <td className="border-grey-light border p-2">{row.waist}</td>
                    <td className="border-grey-light border p-2">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-grey-dark text-[11px]">{group.note}</p>
          </div>
        ))}

        <div className="space-y-2">
          <h3 className="font-heading text-lg tracking-wide uppercase">
            Calzado
          </h3>
          <table className="border-grey-light w-full border text-left text-xs">
            <thead className="bg-offwhite font-space-mono text-[10px] tracking-widest uppercase">
              <tr>
                <th className="border-grey-light border p-2">Talla</th>
                <th className="border-grey-light border p-2">Edad</th>
                <th className="border-grey-light border p-2">Pie (cm)</th>
              </tr>
            </thead>
            <tbody>
              {FOOTWEAR_GUIDE.filter((row) => row.age === age).map((row) => (
                <tr key={row.size}>
                  <td className="border-grey-light border p-2 font-semibold">
                    {row.size}
                  </td>
                  <td className="border-grey-light border p-2">
                    {AGE_GROUPS[row.age]}
                  </td>
                  <td className="border-grey-light border p-2">{row.footLength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
