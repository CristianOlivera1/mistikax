import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/features/catalog/store-queries";
import { STORE_AGE_ORDER } from "@/features/catalog/store-queries";
import { AGE_GROUPS, type AgeGroup } from "@/lib/constants";

const AGE_HIGHLIGHTS: Record<AgeGroup, string> = {
  kids: "4 a 14 años",
  teens: "Tallas XS a L",
  adults: "Tallas S a XXL",
};

type AgeCollectionProps = {
  byAge: Partial<Record<AgeGroup, StoreProduct>>;
};

export function AgeCollection({ byAge }: AgeCollectionProps) {
  return (
    <div className="border-grey-light bg-card flex flex-col border lg:h-[640px] lg:flex-row">
      {STORE_AGE_ORDER.map((age, index) => {
        const product = byAge[age];

        return (
          <Link
            key={age}
            href={`/catalogo?age=${age}`}
            className="group border-grey-light relative h-[340px] flex-1 overflow-hidden border-b transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] last:border-0 lg:h-auto lg:border-r lg:border-b-0 lg:last:border-r-0 lg:hover:flex-[2]"
          >
            {product ? (
              <Image
                src={product.images[0] ?? ""}
                alt={AGE_GROUPS[age]}
                fill
                unoptimized
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-black/30 transition-colors duration-700 group-hover:bg-black/15" />
            <span className="font-heading absolute top-6 right-6 text-6xl font-light text-white/50">
              0{index + 1}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className="border-premium max-w-lg border-l-2 bg-black/10 p-6 backdrop-blur-md">
                <span className="text-premium mb-2 block text-xs font-bold tracking-[0.2em] uppercase">
                  {AGE_HIGHLIGHTS[age]}
                </span>
                <h3 className="font-heading text-4xl font-medium tracking-tight text-white uppercase">
                  {AGE_GROUPS[age]}
                </h3>
                <p className="mt-3 max-w-sm text-sm font-light text-white/90 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-700 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
                  Polos, camisas, pantalones, calzado y más en tallas para{" "}
                  {AGE_GROUPS[age].toLowerCase()}. Ver colección.
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
