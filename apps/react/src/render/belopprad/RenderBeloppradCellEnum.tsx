import { getContextRef, getContextRefPrefix } from "@/util/renderUtils.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { formatEnumValueDisplayLabel } from "@/util/formatUtils.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import type { BeloppradEnum } from "@/model/arsredovisning/beloppradtyper/BeloppradEnum.ts";
import { IxNonNumeric } from "@/ix/ix.tsx";

/** Port av RenderBeloppradCellEnum.vue — vallistecell. */
export function RenderBeloppradCellEnum(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: BeloppradEnum;
  taxonomyItem: TaxonomyItem;
  yearIndex: number;
  contextRefOverrideYearIndex?: number;
  additionalIxbrlAttrs: Record<string, string>;
}) {
  const {
    taxonomyManager,
    belopprad,
    taxonomyItem,
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
      <span style={{ display: "none" }}>
        <IxNonNumeric
          contextRef={getContextRef(
            taxonomyItem,
            getContextRefPrefix(taxonomyItem),
            contextRefOverrideYearIndex ?? yearIndex,
          )}
          name={taxonomyItem.xmlName}
          additional={additionalIxbrlAttrs}
        >
          {belopp}
        </IxNonNumeric>
      </span>
      {formatEnumValueDisplayLabel(taxonomyManager.getItemByName(belopp))}
    </>
  );
}
