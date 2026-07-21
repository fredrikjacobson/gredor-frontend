import {
  type Belopprad,
  createBelopprad,
  createBeloppradInList,
  deleteBelopprad,
  getBeloppradInList,
  getTaxonomyItemForBelopprad,
  hasBeloppradValue,
  isBeloppradInTaxonomyItemList,
} from "@/model/arsredovisning/Belopprad.ts";
import {
  calculateValuesIntoBelopprad,
  isBeloppradMonetary,
} from "@/model/arsredovisning/beloppradtyper/BeloppradMonetary.ts";
import type {
  Arsredovisning,
  BeloppradSectionName,
} from "@/model/arsredovisning/Arsredovisning.ts";
import {
  hasParentTaxonomyItemMatching,
  isTaxonomyItemTuple,
  type TaxonomyItem,
} from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";

/**
 * React-port av usePrepopulateSection.ts:s kärnlogik. Vue använder per-rad
 * `watch`; vi kör i stället dessa rena funktioner explicit inifrån store.edit
 * (som muterar årsredovisningsgrafen in-place och bumpar revision).
 *
 * "Poolen" är listan med ALLA möjliga belopprader för en sektion (en per
 * taxonomiobjekt). Den visas i redigeringstabellen. Den PERSISTERADE sektionen
 * (`arsredovisning[sectionName]`) innehåller bara rader som har värden — den
 * driver förhandsgranskningen. `syncSectionFromPool` håller den i synk.
 */

/** Bygg poolen med alla belopprader för sektionen (återanvänd befintliga rader). */
export function buildPool(
  taxonomyManager: TaxonomyManager,
  availableTaxonomyItems: TaxonomyItem,
  section: Belopprad[],
): Belopprad[] {
  const pool: Belopprad[] = [];
  for (const taxonomyItem of availableTaxonomyItems.childrenFlat) {
    if (
      !isTaxonomyItemTuple(availableTaxonomyItems) &&
      hasParentTaxonomyItemMatching(taxonomyItem, (parent) =>
        isTaxonomyItemTuple(parent),
      )
    ) {
      // Belopprader i tuples hanteras separat (kan finnas i flera instanser).
      continue;
    }
    // Återanvänd befintlig rad (delar referens med sektionen) eller skapa ny.
    const belopprad =
      getBeloppradInList(section, taxonomyItem) ?? createBelopprad(taxonomyItem);
    pool.push(belopprad);
  }
  return pool;
}

/**
 * Räkna om alla summarader (calculated items) i poolen. Ersätter Vue-appens
 * per-summa `watch`. Poolen är i taxonomi-/radordning, så delsummor kommer före
 * totalsummor → en genomkörning i ordning räcker för nästlade summor, men vi kör
 * två pass för säkerhets skull (idempotent).
 */
export function recalculateSums(
  taxonomyManager: TaxonomyManager,
  pool: Belopprad[],
): void {
  const calcProcessor = taxonomyManager.calculationProcessor;
  for (let pass = 0; pass < 2; pass++) {
    for (const belopprad of pool) {
      if (!isBeloppradMonetary(belopprad)) continue;
      const taxonomyItem = getTaxonomyItemForBelopprad(
        taxonomyManager,
        belopprad,
      );
      if (!taxonomyItem.additionalData.isCalculatedItem) continue;
      const parts = pool.filter((other) =>
        calcProcessor.isConceptIncludedInSum(
          other.taxonomyItemName,
          belopprad.taxonomyItemName,
        ),
      );
      calculateValuesIntoBelopprad(calcProcessor, parts, belopprad);
    }
  }
}

/**
 * Gruppera poolen i sektioner. Port av groupPrepopulatedSection: `groups` kan
 * vara TaxonomyItem[] (varje grupp expanderas till [group, ...childrenFlat], som
 * i noter) eller TaxonomyItem[][] (explicita listor, som i balansräkningen). En
 * belopprad hamnar i första gruppen den matchar.
 */
export function groupPool(
  pool: Belopprad[],
  groups: TaxonomyItem[] | TaxonomyItem[][],
): Belopprad[][] {
  const taxonomyItemsPerGroup: TaxonomyItem[][] = groups.map((group) =>
    Array.isArray(group) ? group : [group, ...group.childrenFlat],
  );
  const result: Belopprad[][] = groups.map(() => []);
  for (const belopprad of pool) {
    for (let i = 0; i < groups.length; i++) {
      if (isBeloppradInTaxonomyItemList(taxonomyItemsPerGroup[i], belopprad)) {
        result[i].push(belopprad);
        break;
      }
    }
  }
  return result;
}

/**
 * Synka den persisterade sektionen mot poolen: rader med värden läggs till
 * (inkl. föräldrar/summarader), rader utan värden tas bort. Ersätter Vue-appens
 * per-rad add/remove-`watch`. Körs efter varje redigering.
 */
export function syncSectionFromPool(
  taxonomyManager: TaxonomyManager,
  pool: Belopprad[],
  arsredovisning: Arsredovisning,
  sectionName: BeloppradSectionName,
  maxNumPreviousYears: number,
): void {
  const section = arsredovisning[sectionName];
  for (const belopprad of pool) {
    const taxonomyItem = getTaxonomyItemForBelopprad(taxonomyManager, belopprad);
    if (
      hasBeloppradValue(
        taxonomyManager,
        belopprad,
        arsredovisning,
        section,
        maxNumPreviousYears,
      )
    ) {
      createBeloppradInList(
        taxonomyManager,
        section,
        taxonomyItem,
        belopprad,
        pool,
        "all",
      );
    } else {
      deleteBelopprad(
        taxonomyManager,
        belopprad,
        section,
        arsredovisning,
        maxNumPreviousYears,
      );
    }
  }
}
