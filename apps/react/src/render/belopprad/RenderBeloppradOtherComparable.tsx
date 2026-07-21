import type { BaseBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { isPercentageBelopprad } from "@/util/renderUtils.ts";
import {
  BaseRenderBeloppradComparable,
  type RenderBeloppradComparablePropsBase,
} from "@/render/belopprad/BaseRenderBeloppradComparable.tsx";

/** Port av RenderBeloppradOtherComparable.vue — icke-monetära jämförbara värden. */
export function RenderBeloppradOtherComparable(
  props: RenderBeloppradComparablePropsBase<BaseBeloppradComparable> & {
    /** Antal jämförelseår (från RenderBelopprad); default 1. Se RenderBeloppradMonetary. */
    numPreviousYears?: number;
  },
) {
  return (
    <BaseRenderBeloppradComparable
      {...props}
      numPreviousYears={props.numPreviousYears ?? 1}
      unit={isPercentageBelopprad(props.belopprad) ? "%" : undefined}
    />
  );
}
