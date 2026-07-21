import { useEffect, useMemo, useState } from "react";
import "@/edit/belopprad/editBelopprad.scss";
import type { Verksamhetsar } from "@/model/arsredovisning/Arsredovisning.ts";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { getPeriodTypeForGroup } from "@/util/noterUtils.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Input } from "@/components/ui/input.tsx";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";
import { groupPool } from "@/edit/belopprad/prepopulate.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";
import { EditGroup } from "@/edit/EditGroup.tsx";

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
  const [filter, setFilter] = useState("");

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

        <div className="space-y-6">
          {groupsOfGroups
            .filter((gog) =>
              gog.children.some((g) => visibleGroups.includes(g)),
            )
            .map((groupOfGroups) => (
              <div key={groupOfGroups.xmlName}>
                <h2 className="mb-3 text-base font-semibold text-ink">
                  {groupOfGroups.additionalData.displayLabel}
                </h2>
                <div className="space-y-4">
                  {groups
                    .map((group, groupIndex) => ({ group, groupIndex }))
                    .filter(
                      ({ group }) =>
                        groupOfGroups.children.includes(group) &&
                        visibleGroups.includes(group),
                    )
                    .map(({ group, groupIndex }) => (
                      <EditGroup
                        key={group.xmlName}
                        id={`noter-${group.xmlName}`}
                        title={group.additionalData.displayLabel ?? ""}
                      >
                        <div className="edit-belopprad-table">
                          <table>
                            {grouped[groupIndex].length > 1 && (
                              <thead>
                                <tr>
                                  <th scope="col">
                                    {group.additionalData.displayLabel}
                                  </th>
                                  <ValueColumnHeader
                                    group={group}
                                    noter={arsredovisning.noter}
                                    verksamhetsar={
                                      arsredovisning.verksamhetsarNuvarande
                                    }
                                  />
                                  {numPreviousYears > 0 &&
                                    arsredovisning.verksamhetsarTidigare[0] && (
                                      <ValueColumnHeader
                                        group={group}
                                        noter={arsredovisning.noter}
                                        verksamhetsar={
                                          arsredovisning.verksamhetsarTidigare[0]
                                        }
                                      />
                                    )}
                                </tr>
                              </thead>
                            )}
                            <tbody>
                              {grouped[groupIndex].map((belopprad) => (
                                <EditBelopprad
                                  key={`${belopprad.taxonomyItemName}-${belopprad.labelType ?? ""}`}
                                  belopprad={belopprad}
                                  comparableNumPreviousYears={numPreviousYears}
                                  stringMinimumLevel={1}
                                  monetaryShowBalanceSign
                                  stringMultiline
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </EditGroup>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </BeloppradEditContext.Provider>
  );
}
