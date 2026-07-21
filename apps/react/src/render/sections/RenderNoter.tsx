import type {
  Arsredovisning,
  Verksamhetsar,
} from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import {
  getTaxonomyItemForBelopprad,
  isBeloppradInTaxonomyItemList,
} from "@/model/arsredovisning/Belopprad.ts";
import {
  getHeaderBeloppraderForNoter,
  getPeriodTypeForGroup,
} from "@/util/noterUtils.ts";
import { RenderBelopprad } from "@/render/belopprad/RenderBelopprad.tsx";

// Dölj "förändringar av [anskaffningsvärden/avskrivningar/...]"-rubriker.
function shouldHideTaxonomyItem(taxonomyItemName: string): boolean {
  return (
    taxonomyItemName.endsWith("ForandringAnskaffningsvardenAbstract") ||
    taxonomyItemName.endsWith("ForandringAvskrivningarAbstract") ||
    taxonomyItemName.endsWith("ForandringUppskrivningarAbstract") ||
    taxonomyItemName.endsWith("ForandringNedskrivningarAbstract")
  );
}

/**
 * Värdekolumnens tabellhuvudcell för en grupp — React-port av den Vue-lokala
 * getValueColumnHeaderCell (som returnerade en VNode).
 */
function ValueColumnHeader(props: {
  groupTaxonomyItem: TaxonomyItem;
  noter: Arsredovisning["noter"];
  verksamhetsar: Verksamhetsar;
}) {
  const periodType = getPeriodTypeForGroup(props.groupTaxonomyItem, props.noter);
  if (periodType === "duration") {
    return (
      <th scope="col" className="value-container">
        {props.verksamhetsar.startdatum}
        <br />–{props.verksamhetsar.slutdatum}
      </th>
    );
  }
  if (periodType === "instant") {
    return (
      <th scope="col" className="value-container">
        {props.verksamhetsar.slutdatum}
      </th>
    );
  }
  return <th scope="col" className="value-container"></th>;
}

/** Port av RenderNoter.vue — noter grupperade med numrering. */
export function RenderNoter(props: {
  arsredovisning: Arsredovisning;
  taxonomyManager: TaxonomyManager;
}) {
  const { arsredovisning, taxonomyManager } = props;
  if (arsredovisning.noter.length === 0) return null;

  const tidigare = arsredovisning.verksamhetsarTidigare;
  const headerGroups = getHeaderBeloppraderForNoter(
    taxonomyManager,
    arsredovisning.noter,
  );

  return (
    <div className="noter">
      <h2>Noter</h2>
      {headerGroups.map(
        (
          { belopprad: headerBelopprad, taxonomyItem: headerTaxonomyItem },
          index,
        ) => (
          <table key={headerBelopprad.taxonomyItemName} className="noter-table">
            <thead>
              <tr>
                <th scope="col">
                  <h3>
                    {`Not ${index + 1}: ${headerTaxonomyItem.additionalData.displayLabel}`}
                  </h3>
                </th>
                <ValueColumnHeader
                  groupTaxonomyItem={headerTaxonomyItem}
                  noter={arsredovisning.noter}
                  verksamhetsar={arsredovisning.verksamhetsarNuvarande}
                />
                {tidigare.length > 0 && (
                  <ValueColumnHeader
                    groupTaxonomyItem={headerTaxonomyItem}
                    noter={arsredovisning.noter}
                    verksamhetsar={tidigare[0]}
                  />
                )}
              </tr>
            </thead>
            <tbody>
              {arsredovisning.noter
                .filter(
                  (belopprad) =>
                    !shouldHideTaxonomyItem(belopprad.taxonomyItemName) &&
                    isBeloppradInTaxonomyItemList(
                      [headerTaxonomyItem, ...headerTaxonomyItem.childrenFlat],
                      belopprad,
                    ),
                )
                .map((belopprad) => (
                  <RenderBelopprad
                    key={belopprad.taxonomyItemName}
                    belopprad={belopprad}
                    comparableNumPreviousYears={Math.min(tidigare.length, 1)}
                    redovisningsvaluta={
                      arsredovisning.redovisningsinformation.redovisningsvaluta
                    }
                    stringShowHeader={
                      getTaxonomyItemForBelopprad(taxonomyManager, belopprad)
                        .additionalData.displayLabel !==
                      headerTaxonomyItem.additionalData.displayLabel
                    }
                    taxonomyManager={taxonomyManager}
                    monetaryShowBalanceSign
                  />
                ))}
            </tbody>
          </table>
        ),
      )}
    </div>
  );
}
