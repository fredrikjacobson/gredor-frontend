import { useEffect, useMemo, useState } from "react";
import "@/edit/belopprad/editBelopprad.scss";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";
import { groupPool } from "@/edit/belopprad/prepopulate.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";
import { EditGroup } from "@/edit/EditGroup.tsx";
import {
  ScrollspySection,
  type ScrollspyGroup,
} from "@/edit/ScrollspySection.tsx";

const MAX_NUM_PREVIOUS_YEARS = 1;

/** Port av EditBalansrakning.vue — grupperad (Tillgångar / Eget kapital & skulder). */
export function EditBalansrakning() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  useArsredovisningStore((s) => s.revision);
  const [taxonomyManager, setTaxonomyManager] = useState<TaxonomyManager | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    void getTaxonomyManager(TaxonomyRootName.BALANSRAKNING).then((m) => {
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
    sectionName: "balansrakning",
    maxNumPreviousYears: MAX_NUM_PREVIOUS_YEARS,
  });

  // Grupper: samma taxonomi-navigering som Vue-appen.
  const groups = useMemo(() => {
    if (!availableTaxonomyItems) return [];
    const c0 = availableTaxonomyItems.children[0];
    return [
      [...c0.children[0].childrenFlat, c0.children[1]],
      [...c0.children[2].childrenFlat, c0.children[3]],
    ];
  }, [availableTaxonomyItems]);

  if (!arsredovisning || !editor || groups.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm text-ink-light shadow-card">
        Laddar balansräkning…
      </div>
    );
  }

  const numPreviousYears = Math.min(
    arsredovisning.verksamhetsarTidigare.length,
    MAX_NUM_PREVIOUS_YEARS,
  );
  const grouped = groupPool(editor.pool, groups);
  const scrollspyGroups: ScrollspyGroup[] = groups.map((group, i) => ({
    id: `balansrakning-${group[0].parent?.xmlName ?? i}`,
    title: group[0].parent?.additionalData.displayLabel ?? `Grupp ${i + 1}`,
  }));

  return (
    <BeloppradEditContext.Provider
      value={{
        taxonomyManager: editor.taxonomyManager,
        editField: editor.editField,
      }}
    >
      <ScrollspySection groups={scrollspyGroups}>
        {groups.map((group, groupIndex) => (
          <EditGroup
            key={scrollspyGroups[groupIndex].id}
            id={scrollspyGroups[groupIndex].id}
            title={scrollspyGroups[groupIndex].title}
          >
            <div className="edit-belopprad-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th className="not-container" scope="col">
                      Not
                    </th>
                    <th className="value-container" scope="col">
                      {arsredovisning.verksamhetsarNuvarande.slutdatum}
                    </th>
                    {numPreviousYears > 0 &&
                      arsredovisning.verksamhetsarTidigare[0] && (
                        <th className="value-container" scope="col">
                          {arsredovisning.verksamhetsarTidigare[0].slutdatum}
                        </th>
                      )}
                  </tr>
                </thead>
                <tbody>
                  {grouped[groupIndex].map((belopprad) => (
                    <EditBelopprad
                      key={`${belopprad.taxonomyItemName}-${belopprad.labelType ?? ""}`}
                      belopprad={belopprad}
                      comparableNumPreviousYears={numPreviousYears}
                      comparableAllowNot
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </EditGroup>
        ))}
      </ScrollspySection>
    </BeloppradEditContext.Provider>
  );
}
