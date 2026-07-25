import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ListTree, PanelLeftClose } from "lucide-react";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import { getTaxonomyManager } from "@/util/TaxonomyManager.ts";
import { cn } from "@/lib/utils.ts";
import { useNoterNav } from "@/edit/noter/NoterNavContext.tsx";
import {
  deriveNoterCategories,
  type NoterNavCategory,
} from "@/edit/noter/noterNav.ts";

/** Närmaste scrollande förälder (editorns pane), annars viewport (null). */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Vänsterrail med ett navigeringsträd över noterna (kategori → not). Speglar
 * EditNoters hopfällning via den delade NoterNav-kontexten, markerar noten som
 * är i vy (IntersectionObserver, samma mönster som ScrollspySection) och
 * scrollar till not-ankaret vid klick. Visas bara på noter-fliken.
 */
export function NoterTreeSidebar({
  collapsed: railCollapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const { collapsed, toggleCategory, expandCategory, filter } = useNoterNav();
  const [categories, setCategories] = useState<NoterNavCategory[] | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getTaxonomyManager(TaxonomyRootName.NOTER).then((manager) => {
      if (active) setCategories(deriveNoterCategories(manager.getRoot()));
    });
    return () => {
      active = false;
    };
  }, []);

  // Filtrera trädet med samma text som EditNoters filter, så navigeringen
  // matchar det som faktiskt visas i panelen.
  const visibleCategories = useMemo(() => {
    if (!categories) return [];
    const needle = filter.trim().toLowerCase();
    if (!needle) return categories;
    return categories
      .map((category) => ({
        ...category,
        notes: category.notes.filter((note) =>
          note.label.toLowerCase().includes(needle),
        ),
      }))
      .filter((category) => category.notes.length > 0);
  }, [categories, filter]);

  // Scrollspy: markera den not som syns mest i redigeringspanelen.
  useEffect(() => {
    if (!categories) return;
    const noteIds = categories.flatMap((c) => c.notes.map((n) => n.xmlName));
    if (noteIds.length === 0) return;

    let observer: IntersectionObserver | null = null;
    const ratios = new Map<string, number>();

    const setup = (): boolean => {
      const els = noteIds
        .map((id) => document.getElementById(`noter-${id}`))
        .filter((el): el is HTMLElement => el != null);
      if (els.length === 0) return false;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            ratios.set(entry.target.id, entry.intersectionRatio);
          }
          let best: string | null = null;
          let bestRatio = 0;
          for (const id of noteIds) {
            const r = ratios.get(`noter-${id}`) ?? 0;
            if (r > bestRatio) {
              bestRatio = r;
              best = id;
            }
          }
          if (best) setActiveNoteId(best);
        },
        { root: getScrollParent(els[0]), threshold: [0, 0.25, 0.5, 0.75, 1] },
      );
      for (const el of els) observer.observe(el);
      return true;
    };

    // Ankaren kan renderas strax efter att EditNoter monterats — försök igen.
    if (setup()) return () => observer?.disconnect();
    const retry = setTimeout(setup, 200);
    return () => {
      clearTimeout(retry);
      observer?.disconnect();
    };
  }, [categories]);

  const navigateToNote = (categoryKey: string, noteKey: string) => {
    expandCategory(categoryKey);
    setActiveNoteId(noteKey);
    // Vänta in att kategorin expanderats och ankaret renderats innan scroll.
    setTimeout(() => {
      document
        .getElementById(`noter-${noteKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  if (railCollapsed) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-r bg-card py-3 max-md:hidden">
        <button
          type="button"
          title="Visa notträd"
          aria-label="Visa notträd"
          onClick={() => onCollapsedChange(false)}
          className="grid size-9 place-items-center rounded-md text-ink-medium hover:bg-accent hover:text-ink"
        >
          <ListTree className="size-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card max-md:hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2 font-medium text-ink">
          <ListTree className="size-4 text-primary" /> Noter
        </div>
        <button
          type="button"
          title="Dölj notträdet"
          aria-label="Dölj notträdet"
          onClick={() => onCollapsedChange(true)}
          className="grid size-7 place-items-center rounded-md text-ink-light hover:bg-accent hover:text-ink"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {visibleCategories.length === 0 && (
          <p className="px-2 py-4 text-xs text-ink-light">
            {filter ? "Inga noter matchade filtreringen." : "Laddar noter…"}
          </p>
        )}

        {visibleCategories.map((category) => {
          const isOpen = !collapsed.has(category.xmlName);
          return (
            <div key={category.xmlName} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggleCategory(category.xmlName)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm font-medium text-ink transition-colors hover:bg-accent"
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 text-ink-light transition-transform duration-150",
                    isOpen && "rotate-90",
                  )}
                />
                <span className="flex-1 truncate">{category.label}</span>
                <span className="text-xs font-normal text-ink-light">
                  {category.notes.length}
                </span>
              </button>

              {isOpen && (
                <ul className="mb-1 ml-[15px] border-l border-line pl-2">
                  {category.notes.map((note) => (
                    <li key={note.xmlName}>
                      <button
                        type="button"
                        onClick={() =>
                          navigateToNote(category.xmlName, note.xmlName)
                        }
                        className={cn(
                          "block w-full truncate rounded-md px-2 py-1 text-left text-xs transition-colors",
                          activeNoteId === note.xmlName
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-ink-medium hover:bg-accent hover:text-ink",
                        )}
                      >
                        {note.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
