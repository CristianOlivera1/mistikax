import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { formatMoney } from "@/lib/format";

type BenefitsBlockProps = {
  freeShippingCents: number;
  leadTime: string;
};

export function BenefitsBlock({
  freeShippingCents,
  leadTime,
}: BenefitsBlockProps) {
  const benefits = [
    {
      icon: "lucide:truck",
      title: "Envío",
      copy: `Despacho en ${leadTime}. Gratis desde ${formatMoney(freeShippingCents)}.`,
    },
    {
      icon: "lucide:rotate-ccw",
      title: "Cambios",
      copy: "7 días para cambiar la talla, sin complicaciones.",
    },
    {
      icon: "lucide:shield-check",
      title: "Pago seguro",
      copy: "Tarjeta, transferencia o pago contra entrega.",
    },
    {
      icon: "lucide:message-circle",
      title: "Ayuda",
      copy: "Atención por WhatsApp: tallas, stock y tu pedido.",
    },
  ];

  return (
    <div className="border-grey-light grid w-full grid-cols-1 border-t border-l md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-cacao border-grey-light relative col-span-1 flex flex-col justify-between overflow-hidden border-r border-b p-8 text-white md:p-12 lg:col-span-2">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <div className="size-2 rounded-full bg-white" />
            <span className="font-space-mono text-xs tracking-widest uppercase">
              Calidad
            </span>
          </div>
          <h3 className="font-heading mb-6 text-3xl font-semibold tracking-tight uppercase">
            Calidad que se nota
          </h3>
          <p className="max-w-md text-lg leading-relaxed font-light">
            Tejidos de algodón, lino y viscosa. Costuras reforzadas y revisión
            de calidad prenda por prenda.
          </p>
        </div>
      </div>
      {benefits.map((benefit) => (
        <div
          key={benefit.title}
          className="bg-surface border-grey-light flex flex-col border-r border-b p-8 md:p-12"
        >
          <span className="text-premium-hover mb-auto">
            <Icon icon={benefit.icon} width={28} height={28} />
          </span>
          <h3 className="font-heading mt-10 mb-3 text-xl font-semibold tracking-[0.1em] uppercase">
            {benefit.title}
          </h3>
          <p className="text-dark/70 text-sm leading-relaxed font-light">
            {benefit.copy}
          </p>
        </div>
      ))}
      <Link
        href="/size-guide"
        className="group border-grey-light relative h-[260px] overflow-hidden border-r border-b md:col-span-2"
      >
        <Image
          src="/images/products/camisa-casual.svg"
          alt="Calce perfecto"
          fill
          unoptimized
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <h3 className="font-heading absolute bottom-0 left-0 p-8 text-3xl leading-tight font-semibold tracking-tight text-white uppercase">
          Garantía de calce perfecto
          <span className="text-base font-light tracking-normal text-white/80 normal-case">
            Mira la guía de tallas
          </span>
        </h3>
      </Link>
    </div>
  );
}
