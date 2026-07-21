import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import {
  type BeloppradTuple,
  filterInstanserWithValuesInTuple,
  getTaxonomyItemNamesWithValuesInTuple,
} from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import type { Redovisningsvaluta } from "@/model/arsredovisning/Redovisningsinformation.ts";
import { isBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { isBeloppradEnum } from "@/model/arsredovisning/beloppradtyper/BeloppradEnum.ts";
import { IxTuple } from "@/ix/ix.tsx";
import { RenderBeloppradCell } from "@/render/belopprad/RenderBeloppradCell.tsx";

/** Port av RenderBeloppradTupleSimple.vue — tuple i enkel tabell utan årsjämförelse. */
export function RenderBeloppradTupleSimple(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: BeloppradTuple;
  redovisningsvaluta: Redovisningsvaluta;
  displayHeader?: string;
}) {
  const { taxonomyManager, belopprad, displayHeader } = props;

  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const namesWithValues = getTaxonomyItemNamesWithValuesInTuple(belopprad, 0);
  const filteredInstanser = filterInstanserWithValuesInTuple(
    belopprad.instanser,
    namesWithValues,
    0,
  );

  if (filteredInstanser.length === 0) return null;

  const numColumns = filteredInstanser[0].belopprader.length;

  return (
    <tr>
      <td colSpan={3}>
        {filteredInstanser.map((instans) => (
          <IxTuple
            key={instans.id}
            name={belopprad.taxonomyItemName}
            tupleID={instans.id}
          />
        ))}

        <div className="rubrik">
          {displayHeader || taxonomyItem.additionalData.displayLabel}
        </div>

        <table className={`render-tuple-instance num-columns-${numColumns}`}>
          <thead>
            <tr>
              {filteredInstanser[0].belopprader.map((instansBelopprad) => (
                <th key={instansBelopprad.taxonomyItemName} scope="col">
                  {namesWithValues.has(instansBelopprad.taxonomyItemName)
                    ? getTaxonomyItemForBelopprad(
                        taxonomyManager,
                        instansBelopprad,
                      ).additionalData.displayLabel
                    : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInstanser.map((instans) => (
              <tr key={instans.id}>
                {instans.belopprader.map((instansBelopprad, i) => (
                  <td
                    key={instansBelopprad.taxonomyItemName}
                    className={
                      isBeloppradComparable(instansBelopprad) &&
                      !isBeloppradEnum(instansBelopprad)
                        ? "numeric"
                        : undefined
                    }
                  >
                    <RenderBeloppradCell
                      additionalIxbrlAttrs={{
                        order: (i + 1).toString(),
                        tupleRef: instans.id,
                      }}
                      belopprad={instansBelopprad}
                      stringRaw
                      taxonomyManager={taxonomyManager}
                      yearIndex={0}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  );
}
