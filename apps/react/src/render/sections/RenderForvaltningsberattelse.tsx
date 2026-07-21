import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import {
  type Belopprad,
  isBeloppradInTaxonomyItemList,
} from "@/model/arsredovisning/Belopprad.ts";
import { RenderBeloppradDisplayAsType } from "@/render/belopprad/RenderBeloppradDisplayAsType.ts";
import { RenderBelopprad } from "@/render/belopprad/RenderBelopprad.tsx";
import { RenderForvaltningsberattelseFlerarsoversikt } from "@/render/sections/forvaltningsberattelse/RenderForvaltningsberattelseFlerarsoversikt.tsx";
import { RenderForvaltningsberattelseForandringar } from "@/render/sections/forvaltningsberattelse/RenderForvaltningsberattelseForandringar.tsx";

/**
 * Port av RenderForvaltningsberattelse.vue. De vanliga grupperna (t.ex.
 * resultatdisposition) renderas via RenderBelopprad. De två specialgrupperna
 * Flerårsöversikt och Förändring eget kapital (som bygger på jämförelse-tuples)
 * är ännu inte porterade och visas som platshållare.
 */
export function RenderForvaltningsberattelse(props: {
  arsredovisning: Arsredovisning;
  taxonomyManager: TaxonomyManager;
}) {
  const { arsredovisning, taxonomyManager } = props;
  if (arsredovisning.forvaltningsberattelse.length === 0) return null;

  const root = taxonomyManager.getRoot();

  // Enkel utdelning: dölj rubrik/summering om villkorat aktieägartillskott saknas.
  const shouldDisplaySimpleUtdelning = !arsredovisning.forvaltningsberattelse.some(
    (item) =>
      item.taxonomyItemName ===
      "se-gen-base:ForslagDispositionUtdelningAterbetalningVillkoratAktieagartillskott",
  );

  const getDisplayAsType = (belopprad: Belopprad) =>
    shouldDisplaySimpleUtdelning &&
    [
      "se-gen-base:ForslagDispositionUtdelning",
      "se-gen-base:FrittEgetKapitalEfterUtdelningBeslutadExtraBolagsstamma",
      "se-gen-base:ForslagDisposition",
    ].includes(belopprad.taxonomyItemName)
      ? RenderBeloppradDisplayAsType.SIMPLE
      : RenderBeloppradDisplayAsType.AUTO;

  const getDisplayHeader = (belopprad: Belopprad) =>
    shouldDisplaySimpleUtdelning &&
    belopprad.taxonomyItemName === "se-gen-base:ForslagDispositionUtdelning"
      ? "Utdelning till ägarna"
      : undefined;

  const getStringShowHeaderAsAbstract = (belopprad: Belopprad) =>
    belopprad.taxonomyItemName === "se-gen-base:StyrelsensYttrandeVinstutdelning";

  const groups = root.children[0].children.map((group) => {
    let items = arsredovisning.forvaltningsberattelse.filter((b) =>
      isBeloppradInTaxonomyItemList([group, ...group.childrenFlat], b),
    );
    if (shouldDisplaySimpleUtdelning) {
      items = items.filter(
        (b) =>
          ![
            "se-gen-base:ForslagDispositionUtdelningSpecificationAbstract",
            "se-gen-base:ForslagDispositionUtdelningAterbetalningVillkoratAktieagartillskott",
            "se-gen-base:ForslagDispositionUtdelningAnnanUtdelning",
          ].includes(b.taxonomyItemName),
      );
    }
    return { group, items };
  });

  return (
    <div>
      <h2>Förvaltningsberättelse</h2>
      {groups.map(({ group, items }, groupIndex) => {
        if (group.xmlName === "se-gen-base:Flerarsoversikt") {
          return (
            <div key={groupIndex} className="group-container">
              <RenderForvaltningsberattelseFlerarsoversikt
                arsredovisning={arsredovisning}
                groupTaxonomyItem={group}
                taxonomyManager={taxonomyManager}
              />
            </div>
          );
        }

        if (group.xmlName === "se-gen-base:ForandringEgetKapital") {
          return (
            <div key={groupIndex} className="group-container">
              <RenderForvaltningsberattelseForandringar
                arsredovisning={arsredovisning}
                taxonomyManager={taxonomyManager}
              />
            </div>
          );
        }

        if (items.length === 0) return null;

        return (
          <div key={groupIndex} className="group-container">
            <table>
              <tbody>
                {items.map((belopprad) => (
                  <RenderBelopprad
                    key={belopprad.taxonomyItemName}
                    belopprad={belopprad}
                    comparableDisplayAsType={getDisplayAsType(belopprad)}
                    comparableNumPreviousYears={0}
                    displayHeader={getDisplayHeader(belopprad)}
                    redovisningsvaluta={
                      arsredovisning.redovisningsinformation.redovisningsvaluta
                    }
                    stringShowHeaderAsAbstract={getStringShowHeaderAsAbstract(
                      belopprad,
                    )}
                    taxonomyManager={taxonomyManager}
                    stringShowHeader
                  />
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
