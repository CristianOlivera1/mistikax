const ITEMS = [
  {
    title: "Envío y entregas",
    body: "Preparamos tu pedido en 24 a 48 horas hábiles. El envío es gratis desde S/ 200; por debajo de ese monto se cobra la tarifa vigente al confirmar el pedido.",
  },
  {
    title: "Cambios y devoluciones",
    body: "Tienes 7 días para cambiar la talla. La prenda debe estar sin uso, con etiquetas y en su empaque original.",
  },
  {
    title: "Cuidado de la prenda",
    body: "Lava a máquina en agua fría con colores similares. No uses blanqueador. Seca a la sombra y plancha a temperatura media.",
  },
] as const;

export function ProductAccordions() {
  return (
    <div className="border-grey-light divide-grey-light divide-y border-y">
      {ITEMS.map((item) => (
        <details key={item.title} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
            {item.title}
            <span className="text-grey-mid text-xl font-light transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="text-grey-dark mt-3 max-w-xl text-sm leading-relaxed">
            {item.body}
          </p>
        </details>
      ))}
    </div>
  );
}
