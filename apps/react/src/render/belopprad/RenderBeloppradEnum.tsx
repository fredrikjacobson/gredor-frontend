import type { BeloppradEnum } from "@/model/arsredovisning/beloppradtyper/BeloppradEnum.ts";
import {
  BaseRenderBeloppradComparable,
  type RenderBeloppradComparablePropsBase,
} from "@/render/belopprad/BaseRenderBeloppradComparable.tsx";
import { RenderBeloppradCellEnum } from "@/render/belopprad/RenderBeloppradCellEnum.tsx";

/** Port av RenderBeloppradEnum.vue — vallistebelopprad. */
export function RenderBeloppradEnum(
  props: RenderBeloppradComparablePropsBase<BeloppradEnum> & {
    /** Antal jämförelseår (från RenderBelopprad); default 1. Se RenderBeloppradMonetary. */
    numPreviousYears?: number;
  },
) {
  return (
    <BaseRenderBeloppradComparable
      {...props}
      numPreviousYears={props.numPreviousYears ?? 1}
      renderCell={(taxonomyItem, yearIndex) => (
        <RenderBeloppradCellEnum
          additionalIxbrlAttrs={props.additionalIxbrlAttrs}
          belopprad={props.belopprad}
          taxonomyItem={taxonomyItem}
          taxonomyManager={props.taxonomyManager}
          yearIndex={yearIndex}
        />
      )}
    />
  );
}
