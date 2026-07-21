import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import type { BaseBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { getForandringarAsTable } from "@/util/forandringarUtils.ts";
import { getTestIdForBelopprad } from "@/util/inputUtils.ts";
import { cn } from "@/lib/utils.ts";
import { BeloppradEditContext } from "@/edit/belopprad/BeloppradEditContext.ts";
import { usePrepopulateSection } from "@/edit/belopprad/usePrepopulateSection.ts";

// Vanligt förekommande celler markeras (blå) för att vara enklare att hitta.
const COMMON_TAXONOMY_ITEM_NAMES = new Set([
  "se-gen-base:Aktiekapital",
  "se-gen-base:BalanseratResultat",
  "se-gen-base:AretsResultatEgetKapital",
  "se-gen-base:ForandringEgetKapitalBalanseratResultatUtdelning",
  "se-gen-base:ForandringEgetKapitalAretsResultatUtdelning",
  "se-gen-base:ForandringEgetKapitalTotaltUtdelning",
  "se-gen-base:ForandringEgetKapitalBalanseratResultatBalanserasNyRakning",
  "se-gen-base:ForandringEgetKapitalAretsResultatBalanserasNyRakning",
  "se-gen-base:ForandringEgetKapitalTotaltBalanserasNyRakning",
  "se-gen-base:ForandringEgetKapitalAretsResultatAretsResultat",
  "se-gen-base:ForandringEgetKapitalTotaltAretsResultat",
  "se-gen-base:ForandringEgetKapitalTotalt",
]);

/**
 * Port av EditForvaltningsberattelseForandringar.vue — rutnätet för förändring i
 * eget kapital. Egen pool (sub-editor) + eget context. Planen: inline (inte
 * modal) med horisontell scroll när den blir bred.
 */
export function EditForvaltningsberattelseForandringar({
  taxonomyManager,
  groupTaxonomyItem,
}: {
  taxonomyManager: TaxonomyManager;
  groupTaxonomyItem: TaxonomyItem;
}) {
  const editor = usePrepopulateSection({
    taxonomyManager,
    availableTaxonomyItems: groupTaxonomyItem,
    sectionName: "forvaltningsberattelse",
    maxNumPreviousYears: 0,
  });

  if (!editor) return null;

  const groupTaxonomyItemFull = taxonomyManager.getItemByName(
    "se-gen-base:ForandringEgetKapitalAbstract",
  );
  const forandringarTable = getForandringarAsTable(
    taxonomyManager,
    groupTaxonomyItemFull,
    editor.pool,
  );

  return (
    <BeloppradEditContext.Provider
      value={{
        taxonomyManager: editor.taxonomyManager,
        editField: editor.editField,
      }}
    >
      <p className="mb-2 text-sm text-ink-medium">
        Du kan behöva skrolla i tabellen. De vanligaste cellerna är{" "}
        <strong className="text-[#7070ff]">blåmarkerade</strong>.
      </p>
      <div className="edit-forandringar-wrapper overflow-x-auto">
        <table className="edit-forandringar-table">
          <thead>
            <tr>
              <th></th>
              {forandringarTable.columnNames.map((columnName) => (
                <th key={columnName} scope="col">
                  {columnName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {forandringarTable.table.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>
                  <div className="row-label">
                    {forandringarTable.rowNames[rowIndex]}
                  </div>
                </td>
                {row.map((cell, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={cn(
                      "value-cell",
                      cell == null && "empty-cell",
                      cell != null &&
                        COMMON_TAXONOMY_ITEM_NAMES.has(
                          cell.taxonomyItem.xmlName,
                        ) &&
                        "common-cell",
                    )}
                  >
                    {cell != null && (
                      <input
                        type="text"
                        className="forandringar-input"
                        data-testid={getTestIdForBelopprad(cell.belopprad)}
                        value={cell.belopprad.beloppNuvarandeAr}
                        onChange={(e) =>
                          editor.editField(cell.belopprad, (b) => {
                            (b as BaseBeloppradComparable).beloppNuvarandeAr =
                              e.target.value;
                          })
                        }
                        onBlur={(e) =>
                          editor.editField(cell.belopprad, (b) => {
                            (b as BaseBeloppradComparable).beloppNuvarandeAr =
                              e.target.value.trim();
                          })
                        }
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BeloppradEditContext.Provider>
  );
}
