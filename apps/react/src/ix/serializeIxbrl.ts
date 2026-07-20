import {
  collectUsedCssRules,
  convertHTMLToiXBRL,
} from "@/util/ixbrlSerializer.ts";

/**
 * React-appens iXBRL-serialiserare. Använder den delade ixbrlSerializer-kärnan
 * i @gredor/domain (samma fixTag/xmlns/xml-format som Vue-appen), men med en
 * React-anpassad CSS-insamling: ingen "data-v-"-sanity-check, eftersom React +
 * Tailwind inte har Vues scoped-CSS-attribut.
 *
 * @param rootElement - Elementet vars innerHTML ska serialiseras.
 * @param options - Titel, programversion och whitelist för inbäddade typsnitt.
 */
export function serializeReactHTMLToiXBRL(
  rootElement: HTMLElement,
  options: {
    title: string;
    programVersion: string;
    fontFamilyWhitelist?: string[];
    /** Kräv @font-face i CSS:en (när render.scss + typsnitt är inkopplade). */
    requireFonts?: boolean;
  },
): Promise<string> {
  return convertHTMLToiXBRL(rootElement, {
    title: options.title,
    programVersion: options.programVersion,
    collectUsedCss: (doc) =>
      collectUsedCssRules(doc, {
        fontFamilyWhitelist: options.fontFamilyWhitelist ?? [],
        requiredMarkers: options.requireFonts ? ["@font-face"] : [],
      }),
  });
}
