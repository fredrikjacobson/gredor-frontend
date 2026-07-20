import {
  type BeloppradString,
  hasBeloppradStringValue,
} from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { RenderBeloppradCellString } from "@/render/belopprad/RenderBeloppradCellString.tsx";

/** Port av RenderBeloppradString.vue. */
export function RenderBeloppradString(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: BeloppradString;
  additionalIxbrlAttrs: Record<string, string>;
  displayAsLevel?: number;
  displayHeader?: string;
  contextRefPrefix: "period" | "balans";
  showHeader: boolean;
  showHeaderAsAbstract: boolean;
  raw: boolean;
}) {
  const {
    taxonomyManager,
    belopprad,
    additionalIxbrlAttrs,
    displayAsLevel,
    displayHeader,
    showHeader,
    showHeaderAsAbstract,
    raw,
  } = props;

  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const displayLevel = displayAsLevel ?? taxonomyItem.level;
  const isEmptyValue = !belopprad?.text?.trim();

  const isAbstract = taxonomyItem.properties.abstract === "true";
  const shouldRender =
    (showHeader && isAbstract) ||
    (taxonomyItem.children.length > 0 && showHeader) ||
    hasBeloppradStringValue(belopprad);

  if (!shouldRender) return null;

  const classes = [
    `level-${displayLevel}`,
    isAbstract ? "abstract" : "",
    showHeader && showHeaderAsAbstract ? "abstract-header" : "",
    isEmptyValue ? "empty-value" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={classes}>
      <td colSpan={4}>
        {showHeader && (
          <div className="header">
            {displayHeader || taxonomyItem.additionalData.displayLabel}
          </div>
        )}
        {belopprad.text && (
          <RenderBeloppradCellString
            additionalIxbrlAttrs={additionalIxbrlAttrs}
            belopprad={belopprad}
            raw={raw}
            taxonomyItem={taxonomyItem}
            yearIndex={0}
          />
        )}
      </td>
    </tr>
  );
}
