import Link from "next/link";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkHref,
  linkLabel = "Ver todo",
}: SectionHeadingProps) {
  return (
    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <span className="text-premium font-space-mono mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
          {eyebrow}
        </span>
        <h2 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase md:text-6xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="text-grey-dark max-w-sm text-base leading-relaxed font-light tracking-wide md:text-right">
          {description}
        </p>
      ) : null}
      {linkHref ? (
        <Link
          href={linkHref}
          className="border-dark hover:bg-dark hover:text-background self-start border px-6 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors md:self-end"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
