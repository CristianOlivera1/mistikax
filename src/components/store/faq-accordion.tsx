import type { FaqItem } from "@/features/content/types";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-grey-light divide-grey-light divide-y border-y">
      {items.map((faq) => (
        <details key={faq.id} className="group py-7">
          <summary className="hover:text-premium-hover flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium transition-colors">
            {faq.question}
            <span className="text-grey-mid text-2xl font-light transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="text-grey-dark mt-3 max-w-xl text-sm leading-relaxed">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
