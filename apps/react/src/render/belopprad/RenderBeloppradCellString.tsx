import { type BeloppradString } from "@/model/arsredovisning/beloppradtyper/BeloppradString.ts";
import { getContextRef, getContextRefPrefix } from "@/util/renderUtils.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { IxNonNumeric } from "@/ix/ix.tsx";

/**
 * Renderar en beloppradscell för textsträngar (ix:nonNumeric) — port av
 * RenderBeloppradCellString.vue. Rå text eller ett stycke per rad.
 */
export function RenderBeloppradCellString(props: {
  belopprad: BeloppradString;
  taxonomyItem: TaxonomyItem;
  yearIndex: number;
  contextRefOverrideYearIndex?: number;
  additionalIxbrlAttrs: Record<string, string>;
  raw: boolean;
}) {
  const {
    belopprad,
    taxonomyItem,
    yearIndex,
    contextRefOverrideYearIndex,
    additionalIxbrlAttrs,
    raw,
  } = props;

  const lines = belopprad.text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  return (
    <IxNonNumeric
      contextRef={getContextRef(
        taxonomyItem,
        getContextRefPrefix(taxonomyItem),
        contextRefOverrideYearIndex ?? yearIndex,
      )}
      name={belopprad.taxonomyItemName}
      additional={additionalIxbrlAttrs}
    >
      {raw ? (
        <span>{belopprad.text}</span>
      ) : (
        lines.map((line, index) => <p key={index}>{line}</p>)
      )}
    </IxNonNumeric>
  );
}
