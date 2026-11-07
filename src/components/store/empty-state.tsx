import Link from "next/link";

type StoreEmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function StoreEmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: StoreEmptyStateProps) {
  return (
    <div className="border-grey-light flex flex-col items-center justify-center border px-6 py-24 text-center">
      <p className="text-premium font-space-mono mb-4 text-xs font-bold tracking-[0.2em] uppercase">
        Sin resultados
      </p>
      <h2 className="font-heading text-4xl font-light tracking-[0.05em] uppercase">
        {title}
      </h2>
      <p className="text-grey-dark mt-4 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite mt-10 px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
