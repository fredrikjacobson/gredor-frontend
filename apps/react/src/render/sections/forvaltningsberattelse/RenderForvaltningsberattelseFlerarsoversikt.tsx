import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { formatDateForFlerarsoversikt } from "@/util/formatUtils.ts";
import { isBeloppradInTaxonomyItemList } from "@/model/arsredovisning/Belopprad.ts";
import { BaseRenderBeloppradLevel1Header } from "@/render/belopprad/BaseRenderBeloppradLevel1Header.tsx";
import { RenderBelopprad } from "@/render/belopprad/RenderBelopprad.tsx";

/** Port av RenderForvaltningsberattelseFlerarsoversikt.vue. */
export function RenderForvaltningsberattelseFlerarsoversikt(props: {
  arsredovisning: Arsredovisning;
  groupTaxonomyItem: TaxonomyItem;
  taxonomyManager: TaxonomyManager;
}) {
  const { arsredovisning, groupTaxonomyItem, taxonomyManager } = props;

  const belopprader = arsredovisning.forvaltningsberattelse.filter((belopprad) =>
    isBeloppradInTaxonomyItemList(groupTaxonomyItem.childrenFlat, belopprad),
  );
  if (belopprader.length === 0) return null;

  const tidigare = arsredovisning.verksamhetsarTidigare;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th scope="col">
              <BaseRenderBeloppradLevel1Header taxonomyItem={groupTaxonomyItem} />
            </th>
            <th className="value-container" scope="col">
              {formatDateForFlerarsoversikt(
                arsredovisning.verksamhetsarNuvarande.slutdatum,
              )}
            </th>
            {tidigare.map((ar, i) => (
              <th key={i} className="value-container" scope="col">
                {formatDateForFlerarsoversikt(ar.slutdatum)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {belopprader.map((belopprad) => (
            <RenderBelopprad
              key={belopprad.taxonomyItemName}
              belopprad={belopprad}
              comparableNumPreviousYears={Math.min(tidigare.length, 3)}
              displayFormat={arsredovisning.installningar.flerarsoversiktBeloppFormat}
              redovisningsvaluta={
                arsredovisning.redovisningsinformation.redovisningsvaluta
              }
              taxonomyManager={taxonomyManager}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
