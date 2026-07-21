import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { createBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { formatDateForFlerarsoversikt } from "@/util/formatUtils.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";
import { EditBeloppradTitle } from "@/edit/belopprad/EditBeloppradTitle.tsx";

const MAX_NUM_PREVIOUS_YEARS = 3;

/** Port av EditForvaltningsberattelseFlerarsoversikt.vue — nyckeltalstabell. */
export function EditForvaltningsberattelseFlerarsoversikt({
  arsredovisning,
  taxonomyManager,
  groupTaxonomyItem,
}: {
  arsredovisning: Arsredovisning;
  taxonomyManager: TaxonomyManager;
  groupTaxonomyItem: TaxonomyItem;
}) {
  const edit = useArsredovisningStore((s) => s.edit);
  // Egen pool (maxNumPreviousYears=3) — skild från huvud-FB-poolen.
  const editor = usePrepopulateSection({
    taxonomyManager,
    availableTaxonomyItems: groupTaxonomyItem,
    sectionName: "forvaltningsberattelse",
    maxNumPreviousYears: MAX_NUM_PREVIOUS_YEARS,
  });

  if (!editor) return null;

  const numPreviousYears = Math.min(
    arsredovisning.verksamhetsarTidigare.length,
    MAX_NUM_PREVIOUS_YEARS,
  );
  const valuta = arsredovisning.redovisningsinformation.redovisningsvaluta.namn;
  const format = arsredovisning.installningar.flerarsoversiktBeloppFormat;

  return (
    <BeloppradEditContext.Provider
      value={{
        taxonomyManager: editor.taxonomyManager,
        editField: editor.editField,
      }}
    >
      <p className="mb-2 text-sm text-ink-medium">
        Beloppen nedan ska skrivas in i <strong>hela kronor</strong>.
      </p>
      <div className="edit-belopprad-table">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <EditBeloppradTitle belopprad={createBelopprad(groupTaxonomyItem)} />
              </th>
              <th className="value-container" scope="col">
                {formatDateForFlerarsoversikt(
                  arsredovisning.verksamhetsarNuvarande.slutdatum,
                )}
              </th>
              {Array.from({ length: numPreviousYears }, (_, i) => (
                <th key={i} className="value-container" scope="col">
                  {formatDateForFlerarsoversikt(
                    arsredovisning.verksamhetsarTidigare[i].slutdatum,
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editor.pool.map((belopprad) => (
              <EditBelopprad
                key={`${belopprad.taxonomyItemName}-${belopprad.labelType ?? ""}`}
                belopprad={belopprad}
                comparableNumPreviousYears={numPreviousYears}
                stringMinimumLevel={1}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="flerarsoversiktFormat"
            checked={format === BeloppFormat.HELTAL}
            onChange={() =>
              edit((ar) => {
                ar.installningar.flerarsoversiktBeloppFormat =
                  BeloppFormat.HELTAL;
              })
            }
          />
          Visa belopp i hela {valuta}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="flerarsoversiktFormat"
            checked={format === BeloppFormat.TUSENTAL}
            onChange={() =>
              edit((ar) => {
                ar.installningar.flerarsoversiktBeloppFormat =
                  BeloppFormat.TUSENTAL;
              })
            }
          />
          Visa belopp i tusentals {valuta}
        </label>
        <p className="pt-1 text-xs text-ink-light">
          Obs: Du ska skriva in beloppen i hela kronor oavsett inställningarna
          ovan.
        </p>
      </div>
    </BeloppradEditContext.Provider>
  );
}
