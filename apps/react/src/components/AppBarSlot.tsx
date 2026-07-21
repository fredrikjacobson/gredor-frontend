import { createContext, useContext } from "react";

/**
 * Delad appbar-slot: rot-layouten (__root) renderar EN appbar och exponerar ett
 * DOM-element som rutter (i praktiken editorn) kan portalera sitt eget innehåll
 * in i — så editorn slipper en egen andra rad. React-context följer med genom
 * portaler, så t.ex. Radix Tabs kan ha sin TabsList i appbaren och TabsContent i
 * sidans body och ändå dela samma Tabs-kontext.
 */
export const AppBarSlotContext = createContext<HTMLElement | null>(null);

export function useAppBarSlot(): HTMLElement | null {
  return useContext(AppBarSlotContext);
}
