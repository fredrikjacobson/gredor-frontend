import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { isPercentageTaxonomyItem } from "@/util/renderUtils.ts";
import { cn } from "@/lib/utils.ts";
import { useBeloppradEdit } from "@/edit/belopprad/BeloppradEditContext.ts";

/** Port av BaseEditBeloppradTitle.vue — radrubriken med nivå-/summa-stilar. */
export function EditBeloppradTitle({
  belopprad,
  displayAsLevel,
}: {
  belopprad: Belopprad;
  displayAsLevel?: number;
}) {
  const { taxonomyManager } = useBeloppradEdit();
  const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
  const displayLevel = displayAsLevel ?? taxonomyItem.level;

  const isAbstract = taxonomyItem.properties.abstract === "true";
  const isString = taxonomyItem.properties.type === "xbrli:stringItemType";
  const isSumma =
    taxonomyItem.additionalData.labelType === "totalLabel" ||
    taxonomyItem.additionalData.isCalculatedItem;

  return (
    <div
      className={cn(
        "belopprad-title flex items-center justify-between gap-1",
        isAbstract && "is-abstract",
        isString && "is-string",
        isSumma && "is-summa",
        `is-level-${displayLevel}`,
      )}
    >
      <span>
        {taxonomyItem.additionalData.displayLabel}
        {isPercentageTaxonomyItem(taxonomyItem) && (
          <span className="ml-1 text-xs text-ink-light">[%]</span>
        )}
      </span>
      {taxonomyItem.properties.documentation && (
        <span
          title={taxonomyItem.properties.documentation}
          className="inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full bg-info text-[10px] font-bold text-white"
        >
          i
        </span>
      )}
    </div>
  );
}
