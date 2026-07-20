import xmlFormat from "xml-formatter";

/**
 * React-anpassad iXBRL-serialiserare.
 *
 * Detta är kärnan ur domänens documentUtils.convertVueHTMLToiXBRL — samma
 * tag-/attribut-versalisering (fixTag), samma xmlns-injektion, xml-formatering
 * och borttagning av <!-- @delete-whitespace --> — MEN utan den Vue-specifika
 * CSS-insamlingen (getCssTextForUsedRules), som är kopplad till Vues scoped-CSS
 * (data-v-attribut och en hård "data-v-"-sanity check). React + Tailwind saknar
 * data-v-, så den delen kräver en egen anpassning i fas 3. För spiken (som
 * bara verifierar ix:-elementens emission) räcker en tom style.
 *
 * När fas 3 kommer bör detta och Vue-varianten dela en gemensam kärna i
 * @gredor/domain, med en app-specifik CSS-insamlare inskjuten.
 */
export function serializeReactHTMLToiXBRL(
  rootElement: HTMLElement,
  options: { title: string; programVersion: string },
): string {
  const doc = new DOMParser().parseFromString(
    rootElement.innerHTML,
    "text/html",
  );

  // Omvandla data-*-attribut (ogiltig XHTML/iXBRL) — samma som documentUtils.
  for (const element of doc.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.startsWith("data-")) {
        if (!element.tagName.includes(":")) {
          element.classList.add(attribute.name);
        }
        element.removeAttribute(attribute.name);
      }
    }
  }

  // Fixa versalisering i taggar och attribut (gemener pga HTML5-parsning).
  function fixTag(
    tagName: string,
    attributeNamesToFix: string[],
    namespaceURI: string,
  ) {
    for (const oldElement of [
      ...doc.getElementsByTagName(tagName.toLowerCase()),
    ]) {
      const newElement = document.createElementNS(namespaceURI, tagName);
      while (oldElement.firstChild) {
        newElement.appendChild(oldElement.firstChild);
      }
      for (let index = oldElement.attributes.length - 1; index >= 0; --index) {
        let attributeName = oldElement.attributes[index].name;
        if (attributeName.startsWith("xmlns:")) {
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

  doc.head.innerHTML += `
      <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
      <meta name="programvara" content="Gredor" />
      <meta name="programversion" content="${options.programVersion}" />
      <title>${options.title}</title>
      <style type="text/css"></style>
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

  xhtml = xhtml.replace(/\s*<!--\s*@delete-whitespace\s?.*?-->\s*/g, "");

  xhtml = xhtml.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/g,
    (_match, openTag, content, closeTag) =>
      `${openTag}${content.replace(/&gt;/g, ">")}${closeTag}`,
  );

  xhtml = xhtml.replace(
    /<a\s*href\s*=\s*["']tel:.+?["']\s*>(.+?)<\/a\s*>/gm,
    (_match, content) => content,
  );

  return xhtml;
}
