import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { readStorage, writeStorage } from "@/stores/gredorStorage.ts";

const AUTOSAVE_KEY = "AppAutosaveArsredovisning";

interface ArsredovisningState {
  arsredovisning: Arsredovisning | null;
  /** Ladda in en årsredovisning (nytt, öppnat, exempel eller autosparat). */
  load: (arsredovisning: Arsredovisning) => void;
  /** Rensa nuvarande årsredovisning (börja om). */
  clear: () => void;
}

export const useArsredovisningStore = create<ArsredovisningState>()(
  immer((set) => ({
    arsredovisning: readStorage<Arsredovisning | null>(AUTOSAVE_KEY, null),
    load: (arsredovisning) =>
      set((state) => {
        state.arsredovisning = arsredovisning;
      }),
    clear: () =>
      set((state) => {
        state.arsredovisning = null;
      }),
  })),
);

/**
 * Kopplar in autospar-persistensen. Replikerar Vue-appens
 * useGredorHighPerformanceStorage:
 * - utgående: skriv till localStorage vid ändring, trailing-throttlad (~300 ms)
 *   samt en sista skrivning vid beforeunload;
 * - inkommande: läs om från localStorage endast när fönstret får fokus.
 *
 * (Vue lyssnade på document "focus"; window "focus" är den tillförlitliga
 * varianten och ger samma beteende.)
 *
 * @returns en avregistreringsfunktion.
 */
export function initArsredovisningPersistence(): () => void {
  let pending = false;

  const flush = () => {
    pending = false;
    writeStorage(AUTOSAVE_KEY, useArsredovisningStore.getState().arsredovisning);
  };

  const unsubscribe = useArsredovisningStore.subscribe(() => {
    if (!pending) {
      pending = true;
      setTimeout(flush, 300);
    }
  });

  const onFocus = () => {
    const stored = readStorage<Arsredovisning | null>(AUTOSAVE_KEY, null);
    useArsredovisningStore.setState({ arsredovisning: stored });
  };
  const onBeforeUnload = () => {
    if (pending) flush();
  };

  window.addEventListener("focus", onFocus);
  window.addEventListener("beforeunload", onBeforeUnload);

  return () => {
    unsubscribe();
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("beforeunload", onBeforeUnload);
  };
}
