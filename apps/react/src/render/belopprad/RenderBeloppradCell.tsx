import { isBeloppradString } from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import {
  type Belopprad,
  getTaxonomyItemForBelopprad,
} from "@/model/arsredovisning/Belopprad.ts";
import { isBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { isBeloppradEnum } from "@/model/arsredovisning/beloppradtyper/BeloppradEnum.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { RenderBeloppradCellString } from "@/render/belopprad/RenderBeloppradCellString.tsx";
import { RenderBeloppradCellEnum } from "@/render/belopprad/RenderBeloppradCellEnum.tsx";
import { RenderBeloppradCellComparable } from "@/render/belopprad/RenderBeloppradCellComparable.tsx";

/**
 * Hjälpcell som renderar en belopprad efter datatyp — port av
 * RenderBeloppradCell.vue. Används av tuple-tabellerna.
 */
export function RenderBeloppradCell(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: Belopprad;
  additionalIxbrlAttrs?: Record<string, string>;
  yearIndex: number;
  contextRefOverrideYearIndex?: number;
  stringRaw?: boolean;
}) {
  const {
    taxonomyManager,
    belopprad,
    yearIndex,
    contextRefOverrideYearIndex,
    stringRaw,
  } = props;
  const additionalIxbrlAttrs = props.additionalIxbrlAttrs ?? {};
  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);

  if (isBeloppradString(belopprad) && belopprad.text) {
    return (
      <RenderBeloppradCellString
        additionalIxbrlAttrs={additionalIxbrlAttrs}
        belopprad={belopprad}
        contextRefOverrideYearIndex={contextRefOverrideYearIndex}
        raw={stringRaw ?? false}
        taxonomyItem={taxonomyItem}
        yearIndex={yearIndex}
      />
    );
  }

  if (isBeloppradEnum(belopprad) && belopprad.beloppNuvarandeAr) {
    return (
      <RenderBeloppradCellEnum
        additionalIxbrlAttrs={additionalIxbrlAttrs}
        belopprad={belopprad}
        contextRefOverrideYearIndex={contextRefOverrideYearIndex}
        taxonomyItem={taxonomyItem}
        taxonomyManager={taxonomyManager}
        yearIndex={yearIndex}
      />
    );
  }

  if (isBeloppradComparable(belopprad) && belopprad.beloppNuvarandeAr) {
    return (
      <RenderBeloppradCellComparable
        additionalIxbrlAttrs={additionalIxbrlAttrs}
        belopprad={belopprad}
        contextRefOverrideYearIndex={contextRefOverrideYearIndex}
        displayFormat={BeloppFormat.HELTAL}
        taxonomyItem={taxonomyItem}
        yearIndex={yearIndex}
      />
    );
  }

  return null;
}
