import { createContext, useContext } from "react";
import type { Belopprad } from "@/model/arsredovisning/Belopprad.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";

export interface BeloppradEditContextValue {
  taxonomyManager: TaxonomyManager;
  /**
   * Redigera ett fält på en belopprad. Muterar raden in-place, räknar om summor
   * och synkar sektionen — allt inom ett enda store.edit (som bumpar revision så
   * redigeraren + förhandsgranskningen renderas om).
   */
  editField: (belopprad: Belopprad, mutator: (b: Belopprad) => void) => void;
}

export const BeloppradEditContext =
  createContext<BeloppradEditContextValue | null>(null);

export function useBeloppradEdit(): BeloppradEditContextValue {
  const ctx = useContext(BeloppradEditContext);
  if (!ctx) {
    throw new Error("useBeloppradEdit måste användas inom BeloppradEditContext");
  }
  return ctx;
}
