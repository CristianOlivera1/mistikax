import type { Metadata } from "next";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { SizeGuideTable } from "@/features/catalog/components/size-guide-table";
import { CLOTHING_GUIDE, FOOTWEAR_GUIDE } from "@/features/catalog/size-guide";
import { AGE_GROUPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description:
    "Medidas de ropa y calzado para niños, jóvenes y adultos. Encuentra tu talla antes de comprar.",
};

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <StoreBreadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Guía de tallas" }]}
      />
      <h1 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase">
        Guía de tallas
      </h1>
      <p className="text-grey-dark mt-4 max-w-2xl text-sm leading-relaxed">
        Mide tu cuerpo sin ropa ajustada y compara con la tabla. Si estás entre
        dos tallas, elige la mayor.
      </p>

      <div className="mt-12 space-y-14">
        {CLOTHING_GUIDE.map((group) => (
          <SizeGuideTable key={group.age} group={group} />
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-2xl tracking-wide uppercase">Calzado</h2>
        <p className="text-grey-dark mt-2 text-xs">
          Mide el pie desde el talón hasta el dedo más largo, con el pie apoyado.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="border-grey-light w-full border text-left text-sm">
            <thead className="bg-offwhite font-space-mono text-[10px] tracking-widest uppercase">
              <tr>
                <th className="border-grey-light border p-3">Talla</th>
                <th className="border-grey-light border p-3">Edad</th>
                <th className="border-grey-light border p-3">Pie (cm)</th>
              </tr>
            </thead>
            <tbody>
              {FOOTWEAR_GUIDE.map((row) => (
                <tr key={row.size}>
                  <td className="border-grey-light border p-3 font-semibold">
                    {row.size}
                  </td>
                  <td className="border-grey-light border p-3">
                    {AGE_GROUPS[row.age]}
                  </td>
                  <td className="border-grey-light border p-3">{row.footLength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
