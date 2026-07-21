import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";

export interface ScrollspyGroup {
  id: string;
  title: string;
}

/**
 * Platt sektionslayout med sticky scrollspy-undernavigering — ersätter
 * accordion-mönstret. Alla grupper är alltid synliga; chip-raden markerar den
 * grupp som är i vy och scrollar till en grupp vid klick (IntersectionObserver,
 * ~80 rader eget i stället för ett bibliotek, enligt planen).
 */
export function ScrollspySection({
  groups,
  children,
}: {
  groups: ScrollspyGroup[];
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>(groups[0]?.id ?? "");
  // Håll senaste synliga gruppers ratio för att välja den översta i vy.
  const ratios = useRef(new Map<string, number>());

  useEffect(() => {
    const els = groups
      .map((g) => document.getElementById(g.id))
      .filter((el): el is HTMLElement => el != null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(entry.target.id, entry.intersectionRatio);
        }
        // Välj den grupp som syns mest (och i dokumentordning vid lika).
        let best: string | null = null;
        let bestRatio = 0;
        for (const g of groups) {
          const r = ratios.current.get(g.id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = g.id;
          }
        }
        if (best) setActiveId(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [groups]);

  return (
    <div>
      <nav className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap gap-2 bg-surface-medium/90 px-1 py-2 backdrop-blur">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() =>
              document
                .getElementById(g.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeId === g.id
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-ink-medium hover:border-primary/50",
            )}
          >
            {g.title}
          </button>
        ))}
      </nav>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
