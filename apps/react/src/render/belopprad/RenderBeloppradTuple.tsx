import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import {
  type BeloppradTuple,
  BeloppradTupleFormat,
  getBeloppradTupleFormat,
} from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import type { Redovisningsvaluta } from "@/model/arsredovisning/Redovisningsinformation.ts";
import { RenderBeloppradTupleSimple } from "@/render/belopprad/RenderBeloppradTupleSimple.tsx";
import { RenderBeloppradTupleComparison } from "@/render/belopprad/RenderBeloppradTupleComparison.tsx";

/** Port av RenderBeloppradTuple.vue — väljer enkel eller jämförelse-tuple. */
export function RenderBeloppradTuple(props: {
  taxonomyManager: TaxonomyManager;
  belopprad: BeloppradTuple;
  redovisningsvaluta: Redovisningsvaluta;
  displayHeader?: string;
  comparableNumPreviousYears: number;
}) {
  const format = getBeloppradTupleFormat(props.belopprad);

  if (format === BeloppradTupleFormat.SIMPLE) {
    return (
      <RenderBeloppradTupleSimple
        belopprad={props.belopprad}
        displayHeader={props.displayHeader}
        redovisningsvaluta={props.redovisningsvaluta}
        taxonomyManager={props.taxonomyManager}
      />
    );
  }

  if (format === BeloppradTupleFormat.COMPARISON) {
    return (
      <RenderBeloppradTupleComparison
        belopprad={props.belopprad}
        displayHeader={props.displayHeader}
        numPreviousYears={props.comparableNumPreviousYears}
        redovisningsvaluta={props.redovisningsvaluta}
        taxonomyManager={props.taxonomyManager}
      />
    );
  }

  return null;
}
