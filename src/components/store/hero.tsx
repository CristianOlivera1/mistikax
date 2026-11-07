import Image from "next/image";
import Link from "next/link";

type HeroProps = {
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
};

export function Hero({ title, subtitle, image, ctaLabel, ctaHref }: HeroProps) {
  return (
    <section className="relative h-[calc(100svh-7rem)] min-h-[520px] w-full overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        unoptimized
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 px-6 text-center">
        <h1 className="font-display mb-6 text-7xl font-extrabold tracking-tighter text-white uppercase drop-shadow-2xl md:text-8xl">
          {title}
        </h1>
        <p className="mb-12 max-w-3xl text-xl leading-relaxed font-medium text-white/90 drop-shadow-lg md:text-2xl">
          {subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={ctaHref}
            className="border-white/20 bg-white/10 px-10 py-5 text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20"
          >
            {ctaLabel}
          </Link>
          <Link
            href="/catalog?sale=1"
            className="hover:text-dark border border-white px-10 py-5 text-xs font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-white"
          >
            Ofertas
          </Link>
        </div>
      </div>
    </section>
  );
}
