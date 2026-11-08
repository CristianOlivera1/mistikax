import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  framed?: boolean;
};

export function BrandMark({ className, framed = false }: BrandMarkProps) {
  const logo = (
    <Image
      src="/svg/logo-full.svg"
      alt="Mistikax"
      width={160}
      height={40}
      loading="eager"
      className={framed ? "h-7 w-auto" : "h-8 w-auto"}
    />
  );

  if (!framed) {
    return (
      <div className={cn("inline-flex items-center", className)}>{logo}</div>
    );
  }

  return (
    <div
      className={cn(
        "bg-background inline-flex rounded-lg px-3 py-2",
        className,
      )}
    >
      {logo}
    </div>
  );
}
