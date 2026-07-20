import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import { type Belopprad, getBeloppradInList, getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import {
  BeloppradTupleFormat,
  getBeloppradTupleFormat,
  isBeloppradTuple
} from "@/model/arsredovisning/beloppradtyper/BeloppradTuple.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";


export function getPeriodTypeForGroup(
  groupTaxonomyItem: TaxonomyItem,
  noter: Belopprad[],
): "duration" | "instant" | undefined {
  // Ta fram en belopprad i gruppen (vi tar den första som kan jämföras mellan
  // år) för att avgöra vilken periodtyp som den (och därmed gruppen) har
  const firstComparableItem = groupTaxonomyItem.childrenFlat.find((child) => {
    if (
      ![
        "xbrli:monetaryItemType",
        "xbrli:decimalItemType",
        "xbrli:pureItemType",
        "xbrli:sharesItemType",
      ].includes(child.properties.type)
    ) {
      // Beloppraden kan inte jämföras mellan år - vi ska inte titta på den
      return false;
    }

    const isInTuple = child.parent!.properties.type.endsWith(
      "Tuple@anonymousType",
    );

    if (!isInTuple) {
      // Beloppraden kan jämföras mellan år och ligger inte i en tuple - då vet
      // vi direkt att vi kan titta på den
      return true;
    } else {
      // Beloppraden kan jämföras mellan år men ligger i en tuple - då måste vi
      // kolla om tuplen som den ligger i också kan jämföras mellan år för att
      // veta om vi kan titata på den
      const belopprad = getBeloppradInList(noter, child.parent!);
      return (
        belopprad != null &&
        isBeloppradTuple(belopprad) &&
        getBeloppradTupleFormat(belopprad) === BeloppradTupleFormat.COMPARISON
      );
    }
  });
  if (!firstComparableItem) {
    // Finns inga jämförbara värden - ingen periodtyp
    return undefined;
  }

  switch (firstComparableItem.properties.periodType) {
    case "duration":
      // Verksamhetsåret som en period, från startdatumet till slutdatumet
      return firstComparableItem.properties.periodType;
    case "instant":
      // Verksamhetsårets balansdag, dvs slutdatum
      return firstComparableItem.properties.periodType;
    case undefined:
      return firstComparableItem.properties.periodType;
    default:
      throw new Error("Unknown periodType");
  }
}

export function getHeaderBeloppraderForNoter(
  taxonomyManager: TaxonomyManager,
  noter: Belopprad[],
) {
  return noter
    .map((belopprad) => {
      const taxonomyItem = getTaxonomyItemForBelopprad(
        taxonomyManager,
        belopprad,
      );
      return { belopprad, taxonomyItem };
    })
    .filter(({ taxonomyItem }) => {
      return (
        taxonomyItem.xmlName === "se-gen-base:RedovisningsprinciperAbstract" ||
        (taxonomyItem.level === 2 &&
          taxonomyItem.parent?.xmlName !==
            "se-gen-base:RedovisningsprinciperAbstract")
      );
    });
}
