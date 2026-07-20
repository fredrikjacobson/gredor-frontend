import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { RenderBelopprad } from "@/render/belopprad/RenderBelopprad.tsx";

/** Port av RenderBalansrakning.vue. taxonomyManager (BALANSRAKNING) laddas av förälder. */
export function RenderBalansrakning(props: {
  arsredovisning: Arsredovisning;
  taxonomyManager: TaxonomyManager;
}) {
  const { arsredovisning, taxonomyManager } = props;

  if (arsredovisning.balansrakning.length === 0) return null;

  const nuvarande = arsredovisning.verksamhetsarNuvarande;
  const tidigare = arsredovisning.verksamhetsarTidigare;

  return (
    <div>
      <table className="br-table">
        <thead>
          <tr>
            <th scope="col">
              <h2>Balansräkning</h2>
            </th>
            <th className="not-container" scope="col">
              Not
            </th>
            <th className="value-container" scope="col">
              {nuvarande.slutdatum}
            </th>
            {tidigare.length > 0 && (
              <th className="value-container" scope="col">
                {tidigare[0].slutdatum}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {arsredovisning.balansrakning.map((belopprad) => (
            <RenderBelopprad
              key={belopprad.taxonomyItemName}
              belopprad={belopprad}
              comparableNumPreviousYears={Math.min(tidigare.length, 1)}
              redovisningsvaluta={
                arsredovisning.redovisningsinformation.redovisningsvaluta
              }
              taxonomyManager={taxonomyManager}
              comparableAllowNot
              stringShowHeader
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
