import { create } from "zustand";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { readStorage, writeStorage } from "@/stores/gredorStorage.ts";

const AUTOSAVE_KEY = "AppAutosaveArsredovisning";

interface ArsredovisningState {
  arsredovisning: Arsredovisning | null;
  /**
   * Bumpar vid varje in-place-redigering. Komponenter (redigeraren + preview)
   * prenumererar på detta för att rendera om, eftersom vi muterar samma
   * objektgraf i stället för att byta referens (se `edit`).
   */
  revision: number;
  /** Ladda in en årsredovisning (nytt, öppnat, exempel eller autosparat). */
  load: (arsredovisning: Arsredovisning) => void;
  /** Rensa nuvarande årsredovisning (börja om). */
  clear: () => void;
  /**
   * Redigera årsredovisningen in-place — som Vue-appen, som muterar den
   * reaktiva grafen direkt och anropar domänmodellens metoder/settrar. Vi
   * använder AVSIKTLIGT inte immer här: domänmodellerna är klass-liknande objekt
   * med metoder som muterar `this`, och immers auto-frysning skulle få dessa
   * mutationer att kasta. I stället muterar vi grafen och bumpar `revision`.
   */
  edit: (mutator: (arsredovisning: Arsredovisning) => void) => void;
}

export const useArsredovisningStore = create<ArsredovisningState>()(
  (set, get) => ({
    arsredovisning: readStorage<Arsredovisning | null>(AUTOSAVE_KEY, null),
    revision: 0,
    load: (arsredovisning) => set({ arsredovisning, revision: 0 }),
    clear: () => set({ arsredovisning: null, revision: 0 }),
    edit: (mutator) => {
      const arsredovisning = get().arsredovisning;
      if (!arsredovisning) return;
      mutator(arsredovisning);
      set((state) => ({ revision: state.revision + 1 }));
    },
  }),
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
