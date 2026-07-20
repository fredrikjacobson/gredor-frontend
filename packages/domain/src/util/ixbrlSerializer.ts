import xmlFormat from "xml-formatter";

/**
 * Ramverksagnostisk iXBRL-serialiserare, delad av Vue- och React-apparna.
 *
 * Tidigare låg allt i documentUtils.convertVueHTMLToiXBRL. Den delen som gör
 * själva transformationen (tag-/attribut-versalisering via fixTag, xmlns,
 * xml-formatering, borttagning av <!-- @delete-whitespace -->) är helt
 * ramverksoberoende och ligger nu här. CSS-insamlingen skjuts in som en
 * callback (collectUsedCss) eftersom den enda skillnaden mellan apparna är en
 * sanity-check: Vue kräver "data-v-" (scoped CSS), React gör inte det.
 */

export interface IxbrlSerializeOptions {
  /** Titel på det resulterande iXBRL-dokumentet. */
  title: string;
  /** Programversion som skrivs i <meta name="programversion">. */
  programVersion: string;
  /** Samlar in den CSS som används av dokumentet (app-specifik). */
  collectUsedCss: (doc: Document) => Promise<string>;
}

/**
 * Konverterar innehållet i ett HTML-element till en iXBRL-XHTML-sträng.
 *
 * @param rootElement - HTML-elementet vars innerHTML ska konverteras.
 * @param options - Titel, programversion och CSS-insamlare.
 */
export async function convertHTMLToiXBRL(
  rootElement: HTMLElement,
  options: IxbrlSerializeOptions,
): Promise<string> {
  const doc = new DOMParser().parseFromString(
    rootElement.innerHTML,
    "text/html",
  );

  // Lägg till CSS (app-specifik insamling)
  let rulesCss = await options.collectUsedCss(doc);

  // Omvandla CSS-attribut som inte är kompatibla med wkhtmltopdf som Bolagsverket använder
  rulesCss = rulesCss.replace(
    /([^A-Za-z-])break-after: page/g,
    "$1page-break-after: always",
  );
  rulesCss = rulesCss.replace(
    /([^A-Za-z-])break-inside: /g,
    "$1page-break-inside: ",
  );

  // Omvandla attribut som börjar på "data-" eftersom de inte är giltig XHTML/iXBRL
  for (const element of doc.querySelectorAll("*")) {
    // element.attributes måste hämtas med spread operator
    for (const attribute of [...element.attributes] /* NOSONAR */) {
      if (attribute.name.startsWith("data-")) {
        if (!element.tagName.includes(":")) {
          // För rena HTML-element lägger vi på attributnamnet som en klass
          element.classList.add(attribute.name);
        }
        element.removeAttribute(attribute.name);
      }
    }
  }
  rulesCss = rulesCss.replace(/\[(data-.+?)]/g, ".$1");

  // Fixa versalisering i taggar och attribut (som blir fel pga att vi kör HTML5 i gui:t)
  function fixTag(
    tagName: string,
    attributeNamesToFix: string[],
    namespaceURI: string,
  ) {
    for (const oldElement of [
      ...doc.getElementsByTagName(tagName.toLowerCase()),
    ]) {
      const newElement = document.createElementNS(namespaceURI, tagName);

      // Copy the children
      while (oldElement.firstChild) {
        newElement.appendChild(oldElement.firstChild); // *Moves* the child
      }

      // Copy the attributes
      for (let index = oldElement.attributes.length - 1; index >= 0; --index) {
        let attributeName = oldElement.attributes[index].name;
        if (attributeName.startsWith("xmlns:")) {
          // Skippa, annars blir det dubbletta xmlns-attribut i taggen, vilket
          // förstör den genererade iXBRL:en i Chromium-baserade webbläsare
          continue;
        }
        for (const fixedAttributeName of attributeNamesToFix) {
          if (attributeName === fixedAttributeName.toLowerCase()) {
            attributeName = fixedAttributeName;
          }
        }
        newElement.setAttribute(
          attributeName,
          oldElement.attributes[index].value,
        );
      }

      // Replace it
      oldElement.parentNode?.replaceChild(newElement, oldElement);
    }
  }

  fixTag(
    "ix:nonNumeric",
    ["contextRef", "continuedAt", "tupleRef"],
    "http://www.xbrl.org/2013/inlineXBRL",
  );
  fixTag(
    "ix:nonFraction",
    ["contextRef", "tupleRef", "unitRef"],
    "http://www.xbrl.org/2013/inlineXBRL",
  );
  fixTag("ix:tuple", ["tupleID"], "http://www.xbrl.org/2013/inlineXBRL");
  fixTag("link:schemaRef", [], "http://www.xbrl.org/2003/linkbase");
  fixTag("xbrli:startDate", [], "http://www.xbrl.org/2003/instance");
  fixTag("xbrli:endDate", [], "http://www.xbrl.org/2003/instance");

  // Skapa slutlig HTML
  doc.head.innerHTML += `
      <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
      <meta name="programvara" content="Gredor" />
      <meta name="programversion" content="${options.programVersion}" />
      <title>${options.title}</title>
      <style type="text/css">${rulesCss}</style>
    `;
  let xhtml = new XMLSerializer().serializeToString(doc);
  xhtml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xhtml;
  xhtml = xhtml.replace(
    '<html xmlns="http://www.w3.org/1999/xhtml">',
    '<html xmlns="http://www.w3.org/1999/xhtml" ' +
      'xmlns:iso4217="http://www.xbrl.org/2003/iso4217" ' +
      'xmlns:ixt="http://www.xbrl.org/inlineXBRL/transformation/2010-04-20" ' +
      'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'xmlns:link="http://www.xbrl.org/2003/linkbase" ' +
      'xmlns:xbrli="http://www.xbrl.org/2003/instance" ' +
      'xmlns:ix="http://www.xbrl.org/2013/inlineXBRL" ' +
      'xmlns:se-gen-base="http://www.taxonomier.se/se/fr/gen-base/2021-10-31" ' +
      'xmlns:se-cd-base="http://www.taxonomier.se/se/fr/cd-base/2021-10-31" ' +
      'xmlns:se-bol-base="http://www.bolagsverket.se/se/fr/comp-base/2020-12-01" ' +
      'xmlns:se-k2-type="http://www.taxonomier.se/se/fr/k2/datatype" ' +
      'xmlns:se-mem-base="http://www.taxonomier.se/se/fr/mem-base/2021-10-31" ' +
      'xmlns:se-gaap-ext="http://www.taxonomier.se/se/fr/gaap/gaap-ext/2021-10-31">',
  );
  xhtml = xmlFormat(xhtml, { collapseContent: true });

  // Ta bort tomrum kring och inklusive <!-- @delete-whitespace -->
  // för att fixa rendrering i XHTML i de aktuella fallen
  xhtml = xhtml.replace(/\s*<!--\s*@delete-whitespace\s?.*?-->\s*/g, "");

  // Fixa ">" blir felaktigt "&gt;" i style-tagg
  xhtml = xhtml.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/g,
    (match, openTag, content, closeTag) => {
      return `${openTag}${content.replace(/&gt;/g, ">")}${closeTag}`;
    },
  );

  // Fixa problem med Safari som automatiskt gör om organisationsnummer till
  // länkar i stil med <a href="tel:556002-1361">556002-1361</a> - dessa måste
  // tas bort
  xhtml = xhtml.replace(
    /<a\s*href\s*=\s*["']tel:.+?["']\s*>(.+?)<\/a\s*>/gm,
    (_match, content) => content,
  );

  // Returnera
  return xhtml;
}

/**
 * Samlar in CSS-texten för alla CSSStyleRules som används av dokumentet, samt
 * bäddar in whitelistade typsnitt. Delad mellan apparna (båda kör Vite).
 *
 * @param doc - Dokumentet vars använda regler ska samlas in.
 * @param options - fontFamilyWhitelist samt requiredMarkers: strängar som MÅSTE
 * finnas i den insamlade CSS:en (annars kastas fel). Vue skickar
 * ["data-v-", "@font-face"] (scoped CSS); React utelämnar "data-v-".
 */
export async function collectUsedCssRules(
  doc: Document,
  options: { fontFamilyWhitelist: string[]; requiredMarkers: string[] },
): Promise<string> {
  const { fontFamilyWhitelist, requiredMarkers } = options;
  const rulesUsed = new Set<CSSRule>();
  const fontFamiliesUsed = new Set<string>();

  function processRule(rule: CSSRule, styleRule: CSSStyleRule) {
    const matchingElements = doc.querySelectorAll(styleRule.selectorText);
    if (matchingElements.length > 0) {
      rulesUsed.add(rule);

      if (styleRule.style.fontFamily) {
        const fontFamilies = styleRule.style.fontFamily
          .split(",")
          .map((fontFamily) => fontFamily.trim().replace(/"/g, ""));
        for (const fontFamily of fontFamilies) {
          fontFamiliesUsed.add(fontFamily);
        }
      }
    }
  }

  for (const sheet of Object.values(document.styleSheets)) {
    if (!isValidStyleSheetForDocument(sheet)) {
      continue;
    }

    for (const rule of Object.values(sheet.cssRules)) {
      if (rule instanceof CSSStyleRule) {
        processRule(rule, rule);
      } else if (
        rule instanceof CSSMediaRule &&
        Array.from(rule.media).includes("screen")
      ) {
        for (const subrule of rule.cssRules) {
          if (
            subrule instanceof CSSStyleRule &&
            subrule.selectorText !== "body"
          ) {
            processRule(rule, subrule);
          }
        }
      }
    }
  }

  let rulesCss = "";
  for (const rule of rulesUsed) {
    rulesCss += rule.cssText + "\n";
  }

  // Typsnitt
  const fontReferencesInDocument =
    await getFontReferencesInDocument(fontFamilyWhitelist);
  for (const fontReference of fontReferencesInDocument) {
    if (fontFamiliesUsed.has(fontReference.fontFamily)) {
      rulesCss += `
        @font-face {
            font-family: "${fontReference.fontFamily}";
            font-weight: ${fontReference.fontWeight};
            font-style: ${fontReference.fontStyle};
            src: ${fontReference.srcBase64};
            unicode-range: "${fontReference.unicodeRange}";
        }`;
    }
  }

  // Sanity checks på den CSS som vi har skapat
  for (const marker of requiredMarkers) {
    if (!rulesCss.includes(marker)) {
      throw new Error(`CSS sanity check failed, ${marker} missing`);
    }
  }

  return rulesCss;
}

async function getFontReferencesInDocument(fontFamilyWhitelist: string[]) {
  // Ursprunglig källa: https://stackoverflow.com/a/75857870
  const fontFiles: Array<{
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    src: string;
    srcBase64: string;
    unicodeRange: string;
  }> = [];

  for (const styleSheet of document.styleSheets) {
    if (!isValidStyleSheetForDocument(styleSheet)) {
      continue;
    }

    const cssRules = styleSheet.cssRules;
    for (const rule of cssRules) {
      if (rule instanceof CSSFontFaceRule) {
        const style = rule.style;

        const fontFamily = style
          .getPropertyValue("font-family")
          .replace(/"/g, "");
        const fontWeight = style.getPropertyValue("font-weight");
        const fontStyle = style.getPropertyValue("font-style");
        const src = style.getPropertyValue("src");
        const unicodeRange = style.getPropertyValue("unicode-range");

        if (
          !fontFamilyWhitelist
            .map((ff) => ff.toLowerCase())
            .includes(fontFamily.toLowerCase())
        ) {
          continue;
        }

        const urlMatches = new RegExp(/\(([^)]+)\)/).exec(src.split(",")[0]);
        const url = urlMatches ? urlMatches[1].replace(/"/g, "") : "";
        const response = await fetch(url);
        const blob = await response.blob();
        const srcBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(`url(${reader.result as string})`);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        fontFiles.push({
          fontFamily,
          fontWeight,
          fontStyle,
          src,
          srcBase64,
          unicodeRange,
        });
      }
    }
  }

  return fontFiles;
}

function isValidStyleSheetForDocument(sheet: CSSStyleSheet) {
  if (!sheet.cssRules) {
    // Händer ibland med injicerad CSS från webbläsartillägg, t.ex. DarkReader
    return false;
  }

  if (
    !(sheet.ownerNode instanceof Element) ||
    !(
      sheet.ownerNode.attributes.getNamedItem("data-vite-dev-id") ||
      sheet.ownerNode.attributes
        .getNamedItem("href")
        ?.value?.toString()
        .startsWith("/assets/")
    )
  ) {
    // Ej våran CSS - kan vara injicerad från tillägg
    return false;
  }

  return true;
}
