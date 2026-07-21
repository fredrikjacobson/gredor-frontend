import { Info } from "lucide-react";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { isPercentageTaxonomyItem } from "@/util/renderUtils.ts";
import { cn } from "@/lib/utils.ts";
import { useBeloppradEdit } from "@/edit/belopprad/BeloppradEditContext.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Visa förklaring"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-ink-light transition-colors hover:bg-surface-dark hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-left leading-snug">
            {taxonomyItem.properties.documentation}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
