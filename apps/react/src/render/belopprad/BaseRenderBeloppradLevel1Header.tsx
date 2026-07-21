import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";

/** Port av BaseRenderBeloppradLevel1Header.vue — nivå 1-rubrik. */
export function BaseRenderBeloppradLevel1Header(props: {
  taxonomyItem: TaxonomyItem;
  displayHeader?: string;
}) {
  return (
    <div className="header">
      {props.displayHeader || props.taxonomyItem.additionalData.displayLabel}
    </div>
  );
}
