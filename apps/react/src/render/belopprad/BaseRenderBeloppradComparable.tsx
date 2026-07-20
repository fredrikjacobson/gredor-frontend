import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import type { BaseBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { RenderBeloppradDisplayAsType } from "@/render/belopprad/RenderBeloppradDisplayAsType.ts";
import { RenderBeloppradCellComparable } from "@/render/belopprad/RenderBeloppradCellComparable.tsx";

export interface RenderBeloppradComparablePropsBase<
  T extends BaseBeloppradComparable,
> {
  taxonomyManager: TaxonomyManager;
  belopprad: T;
  additionalIxbrlAttrs: Record<string, string>;
  displayAsLevel?: number;
  displayFormat: BeloppFormat;
  displayHeader?: string;
  contextRefPrefix: "period" | "balans";
  allowNot: boolean;
  displayAsType: RenderBeloppradDisplayAsType;
}

/**
 * Bas för att rendera en jämförbar belopprad som en tabellrad (tr) med
 * rubrik + värdeceller — port av BaseRenderBeloppradComparable.vue.
 * (Slot-varianterna för specialfall är inte porterade än.)
 */
export function BaseRenderBeloppradComparable(
  props: RenderBeloppradComparablePropsBase<BaseBeloppradComparable> & {
    numPreviousYears: number;
    unit?: string;
    showBalanceSign?: boolean;
  },
) {
  const {
    taxonomyManager,
    belopprad,
    additionalIxbrlAttrs,
    displayAsLevel,
    displayFormat,
    displayHeader,
    allowNot,
    displayAsType,
    numPreviousYears,
    unit,
    showBalanceSign,
  } = props;

  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const displayLevel = displayAsLevel ?? taxonomyItem.level;

  const classes = [
    `level-${displayLevel}`,
    (taxonomyItem.additionalData.labelType === "totalLabel" ||
      taxonomyItem.additionalData.isCalculatedItem) &&
    displayAsType === RenderBeloppradDisplayAsType.AUTO
      ? "summa"
      : "",
    displayAsType === RenderBeloppradDisplayAsType.SUM ? "summa-forced" : "",
    taxonomyItem.additionalData.labelType === "periodEndLabel"
      ? "period-end"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={classes}>
      <td className="rubrik">
        {displayHeader || taxonomyItem.additionalData.displayLabel}
        {unit && <span>[{unit}]</span>}
      </td>
      {allowNot && <td className="not-container">{belopprad.not}</td>}
      <td className="value-container">
        {belopprad.beloppNuvarandeAr.length > 0 ? (
          <RenderBeloppradCellComparable
            additionalIxbrlAttrs={additionalIxbrlAttrs}
            belopprad={belopprad}
            displayFormat={displayFormat}
            showBalanceSign={showBalanceSign}
            taxonomyItem={taxonomyItem}
            yearIndex={0}
          />
        ) : (
          <>&ndash;</>
        )}
      </td>
      {Array.from({ length: numPreviousYears }, (_, i) => i + 1).map((i) => (
        <td key={i} className="value-container">
          {(belopprad.beloppTidigareAr[i - 1]?.length ?? 0) > 0 ? (
            <RenderBeloppradCellComparable
              additionalIxbrlAttrs={additionalIxbrlAttrs}
              belopprad={belopprad}
              displayFormat={displayFormat}
              showBalanceSign={showBalanceSign}
              taxonomyItem={taxonomyItem}
              yearIndex={i}
            />
          ) : (
            <>&ndash;</>
          )}
        </td>
      ))}
    </tr>
  );
}
