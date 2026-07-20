import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { RenderBelopprad } from "@/render/belopprad/RenderBelopprad.tsx";

/** Nivå-override för vissa RR-rader (port av logiken i RenderResultatrakning.vue). */
function getDisplayAsLevelForBelopprad(
  belopprad: Belopprad,
): number | undefined {
  if (belopprad.type === "xbrli:stringItemType") {
    return 2; // alla rubriker likadana
  }
  if (
    [
      "se-gen-base:FinansiellaPoster",
      "se-gen-base:Bokslutsdispositioner",
    ].includes(belopprad.taxonomyItemName)
  ) {
    return 2; // summarader som ska se ut som nivå 2
  }
  return undefined;
}

/** Port av RenderResultatrakning.vue. taxonomyManager laddas av förälder. */
export function RenderResultatrakning(props: {
  arsredovisning: Arsredovisning;
  taxonomyManager: TaxonomyManager;
}) {
  const { arsredovisning, taxonomyManager } = props;

  if (arsredovisning.resultatrakning.length === 0) return null;

  const rader = arsredovisning.resultatrakning.filter(
    (b) =>
      ![
        "se-gen-base:RorelseresultatAbstract",
        "se-gen-base:SkatterAbstract",
      ].includes(b.taxonomyItemName),
  );

  const nuvarande = arsredovisning.verksamhetsarNuvarande;
  const tidigare = arsredovisning.verksamhetsarTidigare;

  return (
    <div>
      <table className="rr-table">
        <thead>
          <tr>
            <th scope="col">
              <h2>Resultaträkning</h2>
            </th>
            <th className="not-container" scope="col">
              Not
            </th>
            <th className="value-container" scope="col">
              {nuvarande.startdatum}
              <br />–{nuvarande.slutdatum}
            </th>
            {tidigare.length > 0 && (
              <th className="value-container" scope="col">
                {tidigare[0].startdatum}
                <br />–{tidigare[0].slutdatum}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rader.map((belopprad) => (
            <RenderBelopprad
              key={belopprad.taxonomyItemName}
              belopprad={belopprad}
              comparableNumPreviousYears={Math.min(tidigare.length, 1)}
              displayAsLevel={getDisplayAsLevelForBelopprad(belopprad)}
              redovisningsvaluta={
                arsredovisning.redovisningsinformation.redovisningsvaluta
              }
              taxonomyManager={taxonomyManager}
              comparableAllowNot
              monetaryShowBalanceSign
              stringShowHeader
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
