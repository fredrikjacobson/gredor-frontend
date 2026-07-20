import {
  getContextRef,
  getContextRefPrefix,
  getNonFractionDecimals,
  getNonFractionScale,
  getSignAttribute,
  getUnitRef,
  shouldShowSign,
} from "@/util/renderUtils.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { formatNumber } from "@/util/formatUtils.ts";
import type { BaseBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { IxNonFraction } from "@/ix/ix.tsx";

/**
 * Renderar en jämförbar beloppradscell (ix:nonFraction) — port av
 * RenderBeloppradCellComparable.vue. Minustecknet visas som text; själva
 * värdet är osignerat och sign-attributet bär tecknet.
 */
export function RenderBeloppradCellComparable(props: {
  belopprad: BaseBeloppradComparable;
  taxonomyItem: TaxonomyItem;
  displayFormat: BeloppFormat;
  showBalanceSign?: boolean;
  yearIndex: number;
  contextRefOverrideYearIndex?: number;
  additionalIxbrlAttrs: Record<string, string>;
}) {
  const {
    belopprad,
    taxonomyItem,
    displayFormat,
    showBalanceSign,
    yearIndex,
    contextRefOverrideYearIndex,
    additionalIxbrlAttrs,
  } = props;

  const belopp =
    yearIndex === 0
      ? belopprad.beloppNuvarandeAr
      : belopprad.beloppTidigareAr[yearIndex - 1];

  return (
    <>
      {shouldShowSign(
        taxonomyItem,
        belopp,
        displayFormat,
        showBalanceSign || false,
      ) && <span>&minus;</span>}
      <IxNonFraction
        contextRef={getContextRef(
          taxonomyItem,
          getContextRefPrefix(taxonomyItem),
          contextRefOverrideYearIndex ?? yearIndex,
        )}
        decimals={getNonFractionDecimals(taxonomyItem, displayFormat)}
        name={taxonomyItem.xmlName}
        scale={getNonFractionScale(taxonomyItem, displayFormat)}
        sign={getSignAttribute(taxonomyItem, belopp)}
        unitRef={getUnitRef(taxonomyItem)}
        format="ixt:numspacecomma"
        additional={additionalIxbrlAttrs}
      >
        {formatNumber(belopp, taxonomyItem, displayFormat, { removeSign: true })}
      </IxNonFraction>
    </>
  );
}
