import { useEffect, useState } from "react";
import "@/edit/belopprad/editBelopprad.scss";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { TaxonomyRootName } from "@/model/taxonomy/TaxonomyItem.ts";
import {
  getTaxonomyManager,
  type TaxonomyManager,
} from "@/util/TaxonomyManager.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";

const MAX_NUM_PREVIOUS_YEARS = 1;

/** Summarader som ska renderas som nivå 2 (matchar Vue EditResultatrakning). */
function getDisplayAsLevel(belopprad: Belopprad): number | undefined {
  if (
    [
      "se-gen-base:FinansiellaPoster",
      "se-gen-base:Bokslutsdispositioner",
    ].includes(belopprad.taxonomyItemName)
  ) {
    return 2;
  }
  return undefined;
}

/** Port av EditResultatrakning.vue — platt belopprad-redigeringstabell. */
export function EditResultatrakning() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  // Rendera om vid in-place-ändringar (summor, add/remove).
  useArsredovisningStore((s) => s.revision);
  const [taxonomyManager, setTaxonomyManager] = useState<TaxonomyManager | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    void getTaxonomyManager(
      TaxonomyRootName.RESULTATRAKNING_KOSTNADSSLAGSINDELAD,
    ).then((m) => {
      if (active) setTaxonomyManager(m);
    });
    return () => {
      active = false;
    };
  }, []);

  const availableTaxonomyItems = taxonomyManager
    ? taxonomyManager.getRoot().children[0]
    : null;

  const editor = usePrepopulateSection({
    taxonomyManager,
    availableTaxonomyItems,
    sectionName: "resultatrakning",
    maxNumPreviousYears: MAX_NUM_PREVIOUS_YEARS,
  });

  if (!arsredovisning || !editor) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-sm text-ink-light shadow-card">
        Laddar resultaträkning…
      </div>
    );
  }

  const numPreviousYears = Math.min(
    arsredovisning.verksamhetsarTidigare.length,
    MAX_NUM_PREVIOUS_YEARS,
  );
  const nuvarande = arsredovisning.verksamhetsarNuvarande;
  const tidigare = arsredovisning.verksamhetsarTidigare[0];

  return (
    <BeloppradEditContext.Provider
      value={{
        taxonomyManager: editor.taxonomyManager,
        editField: editor.editField,
      }}
    >
      <div className="edit-belopprad-table rounded-lg border border-line bg-surface p-4 shadow-card">
        <table>
          <thead>
            <tr>
              <th scope="col"></th>
              <th className="not-container" scope="col">
                Not
              </th>
              <th className="value-container" scope="col">
                {nuvarande.startdatum}
                <br />–{nuvarande.slutdatum}
              </th>
              {numPreviousYears > 0 && tidigare && (
                <th className="value-container" scope="col">
                  {tidigare.startdatum}
                  <br />–{tidigare.slutdatum}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {editor.pool.map((belopprad) => (
              <EditBelopprad
                key={`${belopprad.taxonomyItemName}-${belopprad.labelType ?? ""}`}
                belopprad={belopprad}
                comparableNumPreviousYears={numPreviousYears}
                displayAsLevel={getDisplayAsLevel(belopprad)}
                comparableAllowNot
                monetaryShowBalanceSign
              />
            ))}
          </tbody>
        </table>
      </div>
    </BeloppradEditContext.Provider>
  );
}
