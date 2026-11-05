const STEPS = [
  {
    title: "Elige",
    copy: "Explora el catálogo por edad o categoría y escoge tu prenda.",
  },
  {
    title: "Elige tu talla",
    copy: "Consulta la guía de tallas y selecciona la tuya sin errores.",
  },
  {
    title: "Haz tu pedido",
    copy: "Agrégalo al carrito y confírmalo por WhatsApp o en la web.",
  },
  {
    title: "Recíbelo",
    copy: "Lo preparamos en 24-48 horas y lo enviamos a tu casa.",
  },
] as const;

export function StepsSection() {
  return (
    <div className="border-dark grid grid-cols-1 border-t border-l md:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, index) => (
        <div
          key={step.title}
          className="bg-card border-dark flex flex-col border-r border-b p-8"
        >
          <span className="border-dark text-dark/60 font-space-mono mb-8 flex-[0_0_auto] border-b pb-4 text-[10px] font-bold tracking-widest uppercase">
            ( 0{index + 1} / 04 )
          </span>
          <h3 className="font-heading mb-4 text-3xl leading-[0.95] font-medium tracking-tighter uppercase">
            {step.title}
          </h3>
          <p className="text-grey-dark text-sm leading-relaxed">{step.copy}</p>
        </div>
      ))}
    </div>
  );
}
