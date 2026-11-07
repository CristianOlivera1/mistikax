import type { SizeGuideGroup } from "@/features/catalog/size-guide";

export function SizeGuideTable({ group }: { group: SizeGuideGroup }) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl tracking-wide uppercase">
        {group.title}
      </h2>
      <div className="overflow-x-auto">
        <table className="border-grey-light w-full border text-left text-sm">
          <thead className="bg-offwhite font-space-mono text-[10px] tracking-widest uppercase">
            <tr>
              <th className="border-grey-light border p-3">Talla</th>
              <th className="border-grey-light border p-3">Pecho (cm)</th>
              <th className="border-grey-light border p-3">Cintura (cm)</th>
              <th className="border-grey-light border p-3">Cadera (cm)</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row) => (
              <tr key={row.size}>
                <td className="border-grey-light border p-3 font-semibold">
                  {row.size}
                </td>
                <td className="border-grey-light border p-3">{row.chest}</td>
                <td className="border-grey-light border p-3">{row.waist}</td>
                <td className="border-grey-light border p-3">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-grey-dark text-xs">{group.note}</p>
    </div>
  );
}
