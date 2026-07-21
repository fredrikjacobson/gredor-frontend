import { type ReactNode } from "react";

/**
 * En platt, alltid synlig grupp i redigeraren — ersätter Vue-appens
 * CommonAccordionItem (kollapsad som standard). Titeln är ett scrollspy-ankare
 * (`id`) som undernavigeringen länkar till.
 */
export function EditGroup({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      // scroll-mt: kompensera för den sticky chip-navigeringen vid ankarhopp.
      className="scroll-mt-20 rounded-xl border bg-card p-6 shadow-card"
    >
      <h3 className="mb-4 text-base font-semibold text-ink">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
