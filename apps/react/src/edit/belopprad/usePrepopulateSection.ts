import { useRef } from "react";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import type {
  Arsredovisning,
  BeloppradSectionName,
} from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import {
  buildPool,
  recalculateSums,
  syncSectionFromPool,
} from "@/edit/belopprad/prepopulate.ts";
import type { BeloppradEditContextValue } from "@/edit/belopprad/BeloppradEditContext.ts";

export interface SectionEditor extends BeloppradEditContextValue {
  /** Poolen: alla möjliga belopprader för sektionen (drivs redigeringstabellen). */
  pool: Belopprad[];
}

/**
 * React-port av usePrepopulateSection.ts. Bygger poolen en gång per
 * (årsredovisning-referens × taxonomyManager × sektion) och returnerar en
 * `editField` som muterar in-place, räknar om summor och synkar sektionen.
 *
 * Poolen bevaras via en ref över omrenderingar (revision-bumpar byter inte
 * referens). När en ny årsredovisning laddas (referensen byts) byggs poolen om,
 * precis som Vue-appens arsredovisning-swap-watcher.
 */
export function usePrepopulateSection(args: {
  taxonomyManager: TaxonomyManager | null;
  availableTaxonomyItems: TaxonomyItem | null;
  sectionName: BeloppradSectionName;
  maxNumPreviousYears: number;
}): SectionEditor | null {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const storeEdit = useArsredovisningStore((s) => s.edit);
  const poolRef = useRef<{
    ar: Arsredovisning;
    tm: TaxonomyManager;
    available: TaxonomyItem;
    maxNumPreviousYears: number;
    pool: Belopprad[];
  } | null>(null);

  const {
    taxonomyManager,
    availableTaxonomyItems,
    sectionName,
    maxNumPreviousYears,
  } = args;

  if (!taxonomyManager || !availableTaxonomyItems || !arsredovisning) {
    return null;
  }

  if (
    !poolRef.current ||
    poolRef.current.ar !== arsredovisning ||
    poolRef.current.tm !== taxonomyManager ||
    poolRef.current.available !== availableTaxonomyItems ||
    poolRef.current.maxNumPreviousYears !== maxNumPreviousYears
  ) {
    poolRef.current = {
      ar: arsredovisning,
      tm: taxonomyManager,
      available: availableTaxonomyItems,
      maxNumPreviousYears,
      pool: buildPool(
        taxonomyManager,
        availableTaxonomyItems,
        arsredovisning[sectionName],
      ),
    };
  }
  const pool = poolRef.current.pool;

  const editField = (belopprad: Belopprad, mutator: (b: Belopprad) => void) => {
    storeEdit((ar) => {
      mutator(belopprad);
      recalculateSums(taxonomyManager, pool);
      syncSectionFromPool(
        taxonomyManager,
        pool,
        ar,
        sectionName,
        maxNumPreviousYears,
      );
    });
  };

  return { pool, editField, taxonomyManager };
}
