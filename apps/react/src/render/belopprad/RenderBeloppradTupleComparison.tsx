import { Fragment } from "react";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import {
  type BeloppradTuple,
  filterInstanserWithValuesInTuple,
  getMainValueBeloppradForInstans,
  getTaxonomyItemNamesWithValuesInTuple,
} from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import type { Redovisningsvaluta } from "@/model/arsredovisning/Redovisningsinformation.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { embeddedComparisonTuples } from "@/data/embeddedComparisonTuples.ts";
import { IxTuple } from "@/ix/ix.tsx";
import { RenderBeloppradCell } from "@/render/belopprad/RenderBeloppradCell.tsx";
import { RenderBeloppradCellComparable } from "@/render/belopprad/RenderBeloppradCellComparable.tsx";

/** Port av RenderBeloppradTupleComparison.vue — tuple med årsjämförelse. */
export function RenderBeloppradTupleComparison(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: BeloppradTuple;
  redovisningsvaluta: Redovisningsvaluta;
  displayHeader?: string;
  numPreviousYears: number;
}) {
  const { taxonomyManager, belopprad, displayHeader, numPreviousYears } = props;

  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const namesWithValues = getTaxonomyItemNamesWithValuesInTuple(
    belopprad,
    numPreviousYears,
  );
  const filteredInstanser = filterInstanserWithValuesInTuple(
    belopprad.instanser,
    namesWithValues,
    numPreviousYears,
  );

  if (filteredInstanser.length === 0) return null;

  const mainValuePerInstans = filteredInstanser.map((instans) =>
    getMainValueBeloppradForInstans(instans, belopprad.instanser),
  );
  const mainValueName = mainValuePerInstans[0]?.taxonomyItemName;
  const instansForTableHeader = filteredInstanser[0].belopprader.filter(
    (b) => b.taxonomyItemName !== mainValueName,
  );
  const embedded = embeddedComparisonTuples.includes(taxonomyItem.xmlName);
  const numColumns = filteredInstanser[0].belopprader.length;
  const prevYears = Array.from({ length: numPreviousYears }, (_, i) => i + 1);

  return (
    <tr>
      <td className="render-tuple" colSpan={3}>
        {filteredInstanser.map((instans) => (
          <Fragment key={instans.id}>
            {Array.from({ length: numPreviousYears + 1 }, (_, i) => i).map(
              (yr) => (
                <IxTuple
                  key={yr}
                  name={belopprad.taxonomyItemName}
                  tupleID={`${instans.id}-year${yr}`}
                />
              ),
            )}
          </Fragment>
        ))}

        {!embedded && (
          <div className="rubrik">
            {displayHeader || taxonomyItem.additionalData.displayLabel}
          </div>
        )}

        <table className={`render-tuple-instance num-columns-${numColumns}`}>
          {!embedded && (
            <thead>
              <tr>
                {instansForTableHeader.map((instansBelopprad) => (
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
          )}

          <tbody>
            {filteredInstanser.map((instans, instansIndex) => {
              const mainValue = mainValuePerInstans[instansIndex];
              return (
                <tr key={instans.id} className={`level-${taxonomyItem.level}`}>
                  {instans.belopprader
                    .filter((b) => b.taxonomyItemName !== mainValueName)
                    .map((instansBelopprad, i) => (
                      <td key={instansBelopprad.taxonomyItemName}>
                        <RenderBeloppradCell
                          additionalIxbrlAttrs={{
                            order: (i + 1).toString(),
                            tupleRef: `${instans.id}-year0`,
                          }}
                          belopprad={instansBelopprad}
                          stringRaw
                          taxonomyManager={taxonomyManager}
                          yearIndex={0}
                        />
                        <span style={{ display: "none" }}>
                          {prevYears.map((yr) => (
                            <RenderBeloppradCell
                              key={yr}
                              additionalIxbrlAttrs={{
                                order: (i + 1).toString(),
                                tupleRef: `${instans.id}-year${yr}`,
                              }}
                              belopprad={instansBelopprad}
                              contextRefOverrideYearIndex={yr}
                              stringRaw
                              taxonomyManager={taxonomyManager}
                              yearIndex={0}
                            />
                          ))}
                        </span>
                      </td>
                    ))}

                  <td className="value-container">
                    {mainValue?.beloppNuvarandeAr ? (
                      <RenderBeloppradCellComparable
                        additionalIxbrlAttrs={{
                          order: instans.belopprader.length.toString(),
                          tupleRef: `${instans.id}-year0`,
                        }}
                        belopprad={mainValue}
                        displayFormat={BeloppFormat.HELTAL}
                        taxonomyItem={getTaxonomyItemForBelopprad(
                          taxonomyManager,
                          mainValue,
                        )}
                        yearIndex={0}
                      />
                    ) : (
                      <>&ndash;</>
                    )}
                  </td>
                  {prevYears.map((yr) => (
                    <td key={yr} className="value-container">
                      {mainValue?.beloppTidigareAr?.some((b) => !!b) ? (
                        <RenderBeloppradCellComparable
                          additionalIxbrlAttrs={{
                            order: instans.belopprader.length.toString(),
                            tupleRef: `${instans.id}-year${yr}`,
                          }}
                          belopprad={mainValue}
                          displayFormat={BeloppFormat.HELTAL}
                          taxonomyItem={getTaxonomyItemForBelopprad(
                            taxonomyManager,
                            mainValue,
                          )}
                          yearIndex={yr}
                        />
                      ) : (
                        <>&ndash;</>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </td>
    </tr>
  );
}
