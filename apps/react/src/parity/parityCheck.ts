import { XMLParser } from "fast-xml-parser";
import { diff } from "json-diff-ts";
import { convertiXBRLToXBRL } from "@/util/convertiXBRLToXBRL.ts";

export interface ParityChange {
  type: string;
  key: string;
}

/**
 * Normaliserar obetydligt blanktecken-brus i berättande textnoder: kollapsar
 * whitespace-sekvenser (inkl. \r\n och indentering) till ett mellanslag och
 * trimmar. XBRL-faktavärden (belopp, datum, enum) saknar interna
 * whitespace-sekvenser och påverkas inte — bara narrativ text (t.ex.
 * fastställelseintygets löptext) där Vues template-compiler (condense) och
 * Reacts JSX skiljer sig i icke-semantiskt blanktecken. Detta gör oraklet
 * robust mot kosmetiskt blanktecken men fångar fortfarande verkliga skillnader
 * (saknade mellanslag går inte att normalisera bort).
 */
function normalizeWhitespace<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(normalizeWhitespace) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeWhitespace(v);
    }
    return out as T;
  }
  return value;
}

/**
 * Kör samma semantiska XBRL-fakta-orakel som xbrloutput.cy.ts, men helt i
 * webbläsaren med appens egen domänkod: konverterar en genererad iXBRL-sträng
 * till XBRL och json-diff:ar den mot den förväntade XML:en. Returnerar en platt
 * lista av (typ, nyckel)-skillnader — tom lista = paritet.
 *
 * Exponeras på `window.__gredorParity` i dev/test (se main.tsx) så att
 * Playwright-testet kan driva skicka-in-wizarden och sedan asserta 0 skillnader
 * utan att importera domänkoden i Node.
 */
export function runParityCheck(
  ixbrl: string,
  expectedXml: string,
): ParityChange[] {
  const actualXbrl = convertiXBRLToXBRL(ixbrl);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    preserveOrder: false,
  });
  const expected = normalizeWhitespace(parser.parse(expectedXml));
  const actual = normalizeWhitespace(parser.parse(actualXbrl));
  const diffs = diff(expected, actual, {
    embeddedObjKeys: {
      ".xbrli:xbrl.xbrli:context": "@_id",
      ".xbrli:xbrl.xbrli:unit": "@_id",
    },
  });

  const flat: ParityChange[] = [];
  const walk = (changes: unknown[], prefix: string) => {
    for (const c of changes as Array<Record<string, unknown>>) {
      const key = `${prefix}${String(c.key)}`;
      if (Array.isArray(c.changes)) {
        walk(c.changes as unknown[], `${key}.`);
      } else {
        flat.push({ type: String(c.type), key });
      }
    }
  };
  walk(diffs as unknown[], "");
  return flat;
}
