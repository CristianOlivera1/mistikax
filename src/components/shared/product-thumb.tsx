import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductThumbProps = {
  name: string;
  src?: string;
  className?: string;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ProductThumb({ name, src, className }: ProductThumbProps) {
  return (
    <span
      className={cn(
        "border-border bg-muted relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="80px"
          unoptimized
          className="object-cover"
        />
      ) : (
        <span
          className="text-muted-foreground text-[10px] font-semibold tracking-tight"
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
