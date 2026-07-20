import { getAppFullVersion } from "@/util/configUtils.ts";
import {
  collectUsedCssRules,
  convertHTMLToiXBRL,
} from "@/util/ixbrlSerializer.ts";

/**
 * Konverterar innehållet i ett Vue HTML-element till iXBRL-format.
 *
 * Tunn wrapper runt den delade ixbrlSerializer-kärnan. Vue-appens beteende är
 * oförändrat: samma CSS-insamling (inkl. den scoped-CSS-specifika "data-v-"-
 * sanity-checken) och samma programversion.
 *
 * @param rootElement - HTML-elementet som ska konverteras.
 * @param title - Titeln på det resulterande iXBRL-dokumentet.
 * @param fontFamilyWhitelist - Typsnitt som får bäddas in i dokumentet.
 * @returns En sträng som representerar det konverterade iXBRL-innehållet.
 */
export function convertVueHTMLToiXBRL(
  rootElement: HTMLElement,
  title: string,
  fontFamilyWhitelist: string[],
): Promise<string> {
  return convertHTMLToiXBRL(rootElement, {
    title,
    programVersion: getAppFullVersion(),
    collectUsedCss: (doc) =>
      collectUsedCssRules(doc, {
        fontFamilyWhitelist,
        // Vue scoped CSS måste finnas ("data-v-"), och typsnitt.
        requiredMarkers: ["data-v-", "@font-face"],
      }),
  });
}

/**
 * Skriver ut ett dokument genom webbläsarens utskriftsfunktion.
 *
 * @param doc - Dokumentet som ska skrivas ut (HTML/XHTML/iXBRL)
 */
export function printDocument(doc: string) {
  const printWindow = window.open("", "", "popup,width=800,height=800");
  if (!printWindow) {
    return;
  }

  /* eslint-disable no-useless-escape */
  const htmlToWrite = `${doc}
  <script type="text/javascript">
    window.onafterprint = () => setTimeout(window.close, 500);
    setTimeout(() => {
      window.print();
    }, 500);
  <\/script>
  `;
  /* eslint-enable no-useless-escape */

  printWindow.document.open();
  printWindow.document.write(htmlToWrite);
  printWindow.document.close();
}
