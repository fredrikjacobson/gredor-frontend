import type { BeloppradMonetary } from "@/model/arsredovisning/beloppradtyper/BeloppradMonetary.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import type { Redovisningsvaluta } from "@/model/arsredovisning/Redovisningsinformation.ts";
import {
  BaseRenderBeloppradComparable,
  type RenderBeloppradComparablePropsBase,
} from "@/render/belopprad/BaseRenderBeloppradComparable.tsx";

/** Port av RenderBeloppradMonetary.vue. */
export function RenderBeloppradMonetary(
  props: RenderBeloppradComparablePropsBase<BeloppradMonetary> & {
    redovisningsvaluta: Redovisningsvaluta;
    showBalanceSign: boolean;
  },
) {
  const unit =
    props.displayFormat === BeloppFormat.TUSENTAL
      ? props.redovisningsvaluta.namnKortTusental
      : undefined;

  return (
    <BaseRenderBeloppradComparable
      {...props}
      numPreviousYears={1}
      unit={unit}
    />
  );
}
