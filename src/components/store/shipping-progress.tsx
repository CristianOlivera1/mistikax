import { formatMoney } from "@/lib/format";

type ShippingProgressProps = {
  subtotalCents: number;
  freeShippingCents: number;
};

export function ShippingProgress({
  subtotalCents,
  freeShippingCents,
}: ShippingProgressProps) {
  const remaining = Math.max(0, freeShippingCents - subtotalCents);
  const percent =
    freeShippingCents <= 0
      ? 100
      : Math.min(100, Math.round((subtotalCents / freeShippingCents) * 100));

  return (
    <div className="border-grey-light border-b py-5">
      <p className="mb-3 text-xs tracking-wide">
        {remaining > 0 ? (
          <>
            Te faltan <b className="font-semibold">{formatMoney(remaining)}</b>{" "}
            para el envío gratis.
          </>
        ) : (
          <span className="text-premium-hover font-semibold">
            ¡Tu envío es gratis!
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Progreso para envío gratis"
        className="bg-grey-light h-1 w-full overflow-hidden"
      >
        <div className="bg-premium h-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
