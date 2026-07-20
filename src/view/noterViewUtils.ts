import { h, type VNode } from "vue";
import type { Verksamhetsar } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import { getPeriodTypeForGroup } from "@/util/noterUtils.ts";

/**
 * Genererar en VNode för verksamhetsår som visas i tabellhuvudet, för en grupp
 * taxonomiobjekt. T.ex. "2025-12-31" eller "2027-01-01 – 2027-12-31", beroende
 * på vad det är för grupp.
 *
 * Detta är en Vue-specifik vy-hjälpare (returnerar en VNode) och ligger därför
 * i app-lagret, inte i det ramverksagnostiska @gredor/domain-paketet.
 *
 * @param groupTaxonomyItem - Taxonomiobjektetsgruppen.
 * @param verksamhetsar - Verksamhetsåret för vilken data ska visas.
 * @returns Ett VNode-element som representerar den genererade
 * tabellhuvudcellen.
 */
export function getValueColumnHeaderCell(
  groupTaxonomyItem: TaxonomyItem,
  noter: Belopprad[],
  verksamhetsar: Verksamhetsar,
): VNode {
  const attrs = { scope: "col", class: "value-container" };

  switch (getPeriodTypeForGroup(groupTaxonomyItem, noter)) {
    case "duration":
      // Verksamhetsåret som en period, från startdatumet till slutdatumet
      return h("th", attrs, [
        verksamhetsar.startdatum,
        h("br"),
        "–",
        verksamhetsar.slutdatum,
      ]);
    case "instant":
      // Verksamhetsårets balansdag, dvs slutdatum
      return h("th", attrs, [verksamhetsar.slutdatum]);
    case undefined:
      return h("th", attrs, []);
  }
}
