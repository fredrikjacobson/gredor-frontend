import { XMLParser } from "fast-xml-parser";
import LuhnAlgorithm from "@designbycode/luhn-algorithm";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import type { TaxonomyManager } from "@/util/TaxonomyManager.ts";
import { getHeaderBeloppraderForNoter } from "@/util/noterUtils.ts";
import { getTaxonomyItemForBelopprad } from "@/model/arsredovisning/Belopprad.ts";
import { isBeloppradComparable } from "@/model/arsredovisning/beloppradtyper/BaseBeloppradComparable.ts";
import { convertiXBRLToXBRL } from "@/util/convertiXBRLToXBRL.ts";
import { equalsWithDecimals } from "@/util/compareUtils.ts";

/**
 * Rena kontroller för FinalizeReminder-steget — porterade från
 * FinalizeReminder.vue:s computeds. Speglar Vue exakt (påminnelser om
 * notkopplingar, beloppskrockar och obligatoriska fält).
 */

export interface ReminderTaxonomyManagers {
  forvaltningsberattelse: TaxonomyManager;
  resultatrakning: TaxonomyManager;
  balansrakning: TaxonomyManager;
  noter: TaxonomyManager;
}

function beloppradLists(
  arsredovisning: Arsredovisning,
  managers: ReminderTaxonomyManagers,
) {
  return [
    { list: arsredovisning.forvaltningsberattelse, manager: managers.forvaltningsberattelse },
    { list: arsredovisning.resultatrakning, manager: managers.resultatrakning },
    { list: arsredovisning.balansrakning, manager: managers.balansrakning },
    { list: arsredovisning.noter, manager: managers.noter },
  ];
}

export function orgnrIsFilledAndValid(arsredovisning: Arsredovisning): boolean {
  const orgnr = arsredovisning.foretagsinformation.organisationsnummer;
  return Boolean(
    orgnr &&
      /^\d{6}-?\d{4}$/.test(orgnr) &&
      LuhnAlgorithm.isValid(orgnr.replace("-", "")),
  );
}

export function verksamhetsarDatesAreFilled(arsredovisning: Arsredovisning): boolean {
  return Boolean(
    arsredovisning.verksamhetsarNuvarande?.startdatum &&
      arsredovisning.verksamhetsarNuvarande?.slutdatum &&
      (!arsredovisning.verksamhetsarTidigare ||
        arsredovisning.verksamhetsarTidigare.every(
          (v) => v.startdatum && v.slutdatum,
        )),
  );
}

export function requiredFieldsAreFilled(arsredovisning: Arsredovisning): boolean {
  const underskrifter = arsredovisning.redovisningsinformation.underskrifter;
  return Boolean(
    orgnrIsFilledAndValid(arsredovisning) &&
      verksamhetsarDatesAreFilled(arsredovisning) &&
      arsredovisning.redovisningsinformation.datering &&
      underskrifter.length > 0 &&
      underskrifter.every((s) => s.tilltalsnamn && s.efternamn && s.datum),
  );
}

export function latestSignatureDate(arsredovisning: Arsredovisning): string | null {
  const signatures = arsredovisning.redovisningsinformation.underskrifter;
  if (!signatures || signatures.length === 0) return null;
  let maxDate = new Date(0);
  let maxDatum: string | null = null;
  for (const s of signatures) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.datum)) continue;
    const d = new Date(s.datum);
    if (d > maxDate) {
      maxDate = d;
      maxDatum = s.datum;
    }
  }
  return maxDatum;
}

export interface NoterConnection {
  notnummer: number;
  notLabel: string | undefined;
  connections: string[];
}

export function getNoterConnections(
  arsredovisning: Arsredovisning,
  managers: ReminderTaxonomyManagers,
): NoterConnection[] {
  const headers = getHeaderBeloppraderForNoter(
    managers.noter,
    arsredovisning.noter,
  );
  const lists = beloppradLists(arsredovisning, managers);
  return headers.map(({ taxonomyItem: headerItem }, i) => {
    const notnummer = i + 1;
    const connections: string[] = [];
    for (const { list, manager } of lists) {
      for (const belopprad of list) {
        if (isBeloppradComparable(belopprad) && belopprad.not === notnummer.toString()) {
          const label = getTaxonomyItemForBelopprad(manager, belopprad).additionalData
            .displayLabel;
          if (label) connections.push(label);
        }
      }
    }
    return {
      notnummer,
      notLabel: headerItem.additionalData.displayLabel,
      connections,
    };
  });
}

export interface BeloppradWithNonexistingNot {
  beloppradLabel: string;
  not: string;
}

export function getBeloppraderWithNonexistingNoter(
  arsredovisning: Arsredovisning,
  managers: ReminderTaxonomyManagers,
): BeloppradWithNonexistingNot[] {
  const antalNoter = getNoterConnections(arsredovisning, managers).length;
  const result: BeloppradWithNonexistingNot[] = [];
  for (const { list, manager } of beloppradLists(arsredovisning, managers)) {
    for (const belopprad of list) {
      if (isBeloppradComparable(belopprad) && belopprad.not) {
        const notNumber = Number.parseInt(belopprad.not, 10);
        if (notNumber < 1 || notNumber > antalNoter) {
          result.push({
            beloppradLabel:
              getTaxonomyItemForBelopprad(manager, belopprad).additionalData
                .displayLabel ?? "< okänd belopprad >",
            not: belopprad.not,
          });
        }
      }
    }
  }
  return result;
}

export interface MismatchingValueBelopprad {
  label: string;
  values: { belopp: string; decimals: string }[];
}

/**
 * Hittar belopprader vars koncept förekommer med olika värden på olika ställen
 * i iXBRL:en (efter konvertering till XBRL) — port av mismatchingValueBelopprader.
 */
export function getMismatchingValueBelopprader(
  arsredovisning: Arsredovisning,
  managers: ReminderTaxonomyManagers,
  ixbrl: string | null,
): MismatchingValueBelopprad[] {
  if (!ixbrl) return [];
  const xbrl = convertiXBRLToXBRL(ixbrl);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    preserveOrder: false,
  });
  const parsed = parser.parse(xbrl) as Record<string, Record<string, unknown>>;

  const rowValueMap = new Map<
    string,
    { taxonomyItemName: string; values: { belopp: string; decimals: string }[] }
  >();

  const handleItem = (key: string, item: Record<string, unknown>) => {
    if (!("#text" in item)) return;
    const withoutText = { ...item };
    delete withoutText["#text"];
    delete withoutText["@_decimals"];
    const mapKey = key + JSON.stringify(withoutText);
    if (!rowValueMap.has(mapKey)) {
      rowValueMap.set(mapKey, { taxonomyItemName: key, values: [] });
    }
    rowValueMap.get(mapKey)!.values.push({
      belopp: String(item["#text"]),
      decimals: "@_decimals" in item ? String(item["@_decimals"]) : "INF",
    });
  };

  for (const [key, value] of Object.entries(parsed["xbrli:xbrl"] ?? {})) {
    if (!key.startsWith("se-gen-base:") || typeof value !== "object" || value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => handleItem(key, v as Record<string, unknown>));
    } else {
      handleItem(key, value as Record<string, unknown>);
    }
  }

  const result: MismatchingValueBelopprad[] = [];
  for (const { taxonomyItemName, values } of rowValueMap.values()) {
    const baseValue = values.find((v) => v.decimals === "INF") ?? values[0];
    if (
      values.length > 1 &&
      !values.every((v) =>
        equalsWithDecimals(v.belopp, v.decimals, baseValue.belopp, baseValue.decimals),
      )
    ) {
      let taxonomyItem: TaxonomyItem | null = null;
      for (const { manager } of beloppradLists(arsredovisning, managers)) {
        try {
          taxonomyItem = manager.getItemByName(taxonomyItemName);
        } catch {
          // fortsätt söka i övriga managers
        }
      }
      if (taxonomyItem == null) continue;
      result.push({ label: taxonomyItem.properties.label, values });
    }
  }
  return result;
}
