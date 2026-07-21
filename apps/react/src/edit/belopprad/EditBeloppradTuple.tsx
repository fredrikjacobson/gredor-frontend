import { Trash2 } from "lucide-react";
import type { BeloppradTuple } from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import {
  BeloppradTupleFormat,
  generateTupleID,
  getBeloppradTupleFormat,
  isEditBeloppradTupleFormatAllowed,
} from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import {
  createBelopprad,
  getTaxonomyItemForBelopprad,
} from "@/model/arsredovisning/Belopprad.ts";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  BeloppradEditContext,
  useBeloppradEdit,
} from "@/edit/belopprad/BeloppradEditContext.ts";
import { recalculateSums } from "@/edit/belopprad/prepopulate.ts";
import { EditBelopprad } from "@/edit/belopprad/EditBelopprad.tsx";

/**
 * Port av EditBeloppradTuple.vue. Renderar en rubrikrad (etikett + format-väljare
 * + "Lägg till") och en rad per instans med en nästlad tabell av EditBelopprad.
 *
 * Strukturella ändringar (lägg till/ta bort instans, format) går via sektionens
 * editField så att tuple-raden synkas in i/ut ur sektionen. Fält-ändringar INUTI
 * en instans använder ett nästlat context vars editField bara muterar + räknar om
 * instansens summor + bumpar revision (ingen sektionssynk behövs — tuple-raden är
 * redan i sektionen så länge den har instanser).
 */
export function EditBeloppradTuple({
  belopprad,
  comparableNumPreviousYears,
}: {
  belopprad: BeloppradTuple;
  comparableNumPreviousYears: number;
}) {
  const { taxonomyManager, editField: sectionEditField } = useBeloppradEdit();
  const storeEdit = useArsredovisningStore((s) => s.edit);
  const tupleTaxonomyItem = getTaxonomyItemForBelopprad(
    taxonomyManager,
    belopprad,
  );
  const format = getBeloppradTupleFormat(belopprad);

  const createInstance = () =>
    sectionEditField(belopprad, (b) => {
      (b as BeloppradTuple).instanser.push({
        id: generateTupleID(),
        belopprader: tupleTaxonomyItem.childrenFlat
          .filter((child) => child.properties.type !== "nonnum:domainItemType")
          .map((child) => createBelopprad(child)),
      });
    });

  const deleteInstance = (index: number) =>
    sectionEditField(belopprad, (b) => {
      (b as BeloppradTuple).instanser.splice(index, 1);
    });

  return (
    <>
      <tr className="belopprad-row">
        <td colSpan={1 + comparableNumPreviousYears}>
          <span className="font-medium">
            {tupleTaxonomyItem.additionalData.displayLabel}
          </span>
          {belopprad.instanser.length > 0 &&
            isEditBeloppradTupleFormatAllowed(belopprad) && (
              <span className="ml-4 border-l border-line pl-4 text-sm">
                Format:{" "}
                <select
                  className="belopprad-input ml-1"
                  value={format}
                  onChange={(e) =>
                    sectionEditField(belopprad, (b) => {
                      (b as BeloppradTuple).format = e.target
                        .value as BeloppradTupleFormat;
                    })
                  }
                >
                  <option value={BeloppradTupleFormat.SIMPLE}>
                    Endast detta år
                  </option>
                  <option value={BeloppradTupleFormat.COMPARISON}>
                    Jämförelse mellan år
                  </option>
                </select>
              </span>
            )}
        </td>
        <td>
          <Button type="button" size="sm" className="float-end" onClick={createInstance}>
            Lägg till
          </Button>
        </td>
      </tr>

      {belopprad.instanser.map((instans, instansIndex) => (
        <tr key={instans.id} className="belopprad-row">
          <td colSpan={2 + comparableNumPreviousYears}>
            <div className="ml-6 mb-2 flex items-start gap-2 border-b border-line pb-2">
              <BeloppradEditContext.Provider
                value={{
                  taxonomyManager,
                  editField: (bp: Belopprad, mutator: (b: Belopprad) => void) =>
                    storeEdit(() => {
                      mutator(bp);
                      recalculateSums(taxonomyManager, instans.belopprader);
                    }),
                }}
              >
                <table className="edit-tuple-instance flex-1">
                  <tbody>
                    {instans.belopprader.map((instansBelopprad, i) => {
                      const isLast = i === instans.belopprader.length - 1;
                      const isComparison =
                        format === BeloppradTupleFormat.COMPARISON;
                      return (
                        <EditBelopprad
                          key={`${instansBelopprad.taxonomyItemName}-${i}`}
                          belopprad={instansBelopprad}
                          comparableNumPreviousYears={
                            isComparison && isLast ? comparableNumPreviousYears : 0
                          }
                          valueColspanOverride={
                            isComparison && !isLast
                              ? comparableNumPreviousYears + 1
                              : undefined
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </BeloppradEditContext.Provider>
              <button
                type="button"
                title="Ta bort beloppraden"
                className="mt-1 text-danger hover:opacity-80"
                onClick={() => deleteInstance(instansIndex)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
