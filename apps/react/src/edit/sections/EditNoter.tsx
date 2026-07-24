import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import "@/edit/belopprad/editBelopprad.scss";
import type { Verksamhetsar } from "@/model/arsredovisning/Arsredovisning.ts";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { isBeloppradString } from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { getPeriodTypeForGroup } from "@/util/noterUtils.ts";
import { cn } from "@/lib/utils.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Input } from "@/components/ui/input.tsx";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";
import { groupPool } from "@/edit/belopprad/prepopulate.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";
import { useNoterNav } from "@/edit/noter/NoterNavContext.tsx";

const MAX_NUM_PREVIOUS_YEARS = 1;

/** Värdekolumnens tabellhuvudcell för en not-grupp (period/instant/tomt). */
function ValueColumnHeader({
  group,
  noter,
  verksamhetsar,
}: {
  group: TaxonomyItem;
  noter: Belopprad[];
  verksamhetsar: Verksamhetsar;
}) {
  const periodType = getPeriodTypeForGroup(group, noter);
  if (periodType === "duration") {
    return (
      <th scope="col" className="value-container">
        {verksamhetsar.startdatum}
        <br />–{verksamhetsar.slutdatum}
      </th>
    );
  }
  if (periodType === "instant") {
    return (
      <th scope="col" className="value-container">
        {verksamhetsar.slutdatum}
      </th>
    );
  }
  return <th scope="col" className="value-container"></th>;
}

/** Port av EditNoter.vue — noter grupperade per kategori, med filter. */
export function EditNoter() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  useArsredovisningStore((s) => s.revision);
  const [taxonomyManager, setTaxonomyManager] = useState<TaxonomyManager | null>(
    null,
  );
  // Delad med notträdet i vänsterrailen (hopfällda kategorier + filter).
  const { collapsed, toggleCategory, filter, setFilter } = useNoterNav();

  useEffect(() => {
    let active = true;
    void getTaxonomyManager(TaxonomyRootName.NOTER).then((m) => {
      if (active) setTaxonomyManager(m);
    });
    return () => {
      active = false;
    };
  }, []);

  const availableTaxonomyItems = taxonomyManager
    ? taxonomyManager.getRoot()
    : null;

  const editor = usePrepopulateSection({
    taxonomyManager,
    availableTaxonomyItems,
    sectionName: "noter",
    maxNumPreviousYears: MAX_NUM_PREVIOUS_YEARS,
  });

  const { groups, groupsOfGroups } = useMemo(() => {
    if (!availableTaxonomyItems) {
      return { groups: [] as TaxonomyItem[], groupsOfGroups: [] as TaxonomyItem[] };
    }
    const gog = availableTaxonomyItems.children[0].children;
    return { groups: gog.flatMap((c) => c.children), groupsOfGroups: gog };
  }, [availableTaxonomyItems]);

  if (!arsredovisning || !editor || groups.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm text-ink-light shadow-card">
        Laddar noter…
      </div>
    );
  }

  const numPreviousYears = Math.min(
    arsredovisning.verksamhetsarTidigare.length,
    MAX_NUM_PREVIOUS_YEARS,
  );
  const grouped = groupPool(editor.pool, groups);

  const visibleGroups = filter
    ? groups.filter((g) =>
        g.additionalData.displayLabel
          ?.toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : groups;

  return (
    <BeloppradEditContext.Provider
      value={{
        taxonomyManager: editor.taxonomyManager,
        editField: editor.editField,
      }}
    >
      <div>
        <div className="sticky top-0 z-10 -mx-1 mb-4 bg-surface-medium/90 px-1 py-2 backdrop-blur">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Filtrera noter, t.ex. "medelantalet anställda"…'
          />
        </div>

        {visibleGroups.length === 0 && (
          <p className="text-sm text-ink-light">
            Inga noter matchade filtreringen.
          </p>
        )}

        <div className="space-y-4">
          {groupsOfGroups
            .map((groupOfGroups) => ({
              groupOfGroups,
              items: groups
                .map((group, groupIndex) => ({ group, groupIndex }))
                .filter(
                  ({ group }) =>
                    groupOfGroups.children.includes(group) &&
                    visibleGroups.includes(group),
                ),
            }))
            .filter(({ items }) => items.length > 0)
            .map(({ groupOfGroups, items }) => {
              const categoryLabel =
                groupOfGroups.additionalData.displayLabel ?? "";
              const isOpen = !collapsed.has(groupOfGroups.xmlName);
              return (
                <section
                  key={groupOfGroups.xmlName}
                  className="overflow-hidden rounded-xl border bg-card shadow-card"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(groupOfGroups.xmlName)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base font-semibold text-ink">
                        {categoryLabel}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-ink-medium">
                        {items.length}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-ink-light transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isOpen && (
                    // Varje not är en egen panel mot en tonad bakgrund. En ren
                    // avdelare räckte inte — noterna flöt ihop till en enda
                    // lång kolumn av fält.
                    <div className="space-y-3 border-t border-line bg-surface-medium/50 p-4">
                      {items.map(({ group, groupIndex }) => {
                        const rows = grouped[groupIndex];
                        const noteLabel =
                          group.additionalData.displayLabel ?? "";
                        // Visa notrubrik bara när den skiljer sig från
                        // kategorirubriken (annars dubbleras samma text).
                        const showNoteHeading = noteLabel !== categoryLabel;
                        // Enfältsnot: fältet namnges redan av not-/kategori-
                        // rubriken, så dölj den upprepade fältetiketten.
                        const hideRowTitle =
                          rows.length === 1 && isBeloppradString(rows[0]);
                        return (
                          <div
                            key={group.xmlName}
                            id={`noter-${group.xmlName}`}
                            className="scroll-mt-24 rounded-lg border border-line bg-card p-4 shadow-card"
                          >
                            {showNoteHeading && (
                              <h3 className="mb-3 border-b border-line pb-2 text-sm font-semibold text-ink">
                                {noteLabel}
                              </h3>
                            )}
                            <div className="edit-belopprad-table">
                              <table>
                                {rows.length > 1 && (
                                  <thead>
                                    <tr>
                                      {/* Rubrikkolumnens namn utelämnas — noten
                                          namnges redan ovanför tabellen. */}
                                      <th scope="col"></th>
                                      <ValueColumnHeader
                                        group={group}
                                        noter={arsredovisning.noter}
                                        verksamhetsar={
                                          arsredovisning.verksamhetsarNuvarande
                                        }
                                      />
                                      {numPreviousYears > 0 &&
                                        arsredovisning
                                          .verksamhetsarTidigare[0] && (
                                          <ValueColumnHeader
                                            group={group}
                                            noter={arsredovisning.noter}
                                            verksamhetsar={
                                              arsredovisning
                                                .verksamhetsarTidigare[0]
                                            }
                                          />
                                        )}
                                    </tr>
                                  </thead>
                                )}
                                <tbody>
                                  {rows.map((belopprad) => (
                                    <EditBelopprad
                                      key={`${belopprad.taxonomyItemName}-${belopprad.labelType ?? ""}`}
                                      belopprad={belopprad}
                                      comparableNumPreviousYears={
                                        numPreviousYears
                                      }
                                      stringMinimumLevel={1}
                                      monetaryShowBalanceSign
                                      stringMultiline
                                      hideTitle={hideRowTitle}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      </div>
    </BeloppradEditContext.Provider>
  );
}
