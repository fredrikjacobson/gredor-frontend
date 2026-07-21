/**
 * Typade React-omslag för de iXBRL-/XBRL-taggar som årsredovisningen behöver
 * (ix:, xbrli:, link:). JSX kan inte skriva taggar med kolon direkt, så vi går
 * via React.createElement med sträng-taggnamn.
 *
 * Bevisat i fas 0-spiken: webbläsaren gör om taggnamn och attributnamn till
 * gemener precis som för Vue, och documentUtils.fixTag återställer
 * versaliseringen (contextRef, unitRef, tupleID, ...) vid serialisering. Vi
 * emitterar därför attributnamnen i gemener direkt via ATTR() — då blir DOM:en
 * identisk och React slipper klaga på "okända" camelCase-props i dev-läge.
 *
 * Detta är motsvarigheten till Vue-komponenternas namespaced-element och är den
 * enda platsen som "känner till" de råa taggnamnen.
 */
import { createElement, type ReactNode } from "react";

type Children = { children?: ReactNode };

/**
 * Gör om ett attributobjekt till gemena nycklar (som DOM:en ändå skulle
 * producera), och tar bort undefined-värden. fixTag återställer versaliseringen.
 */
function attrs(raw: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined) {
      out[key.toLowerCase()] = value;
    }
  }
  return out;
}

// ---- ix: ------------------------------------------------------------------

export function IxHeader({ children }: Children) {
  return createElement("ix:header", null, children);
}

export function IxHidden({ children }: Children) {
  return createElement("ix:hidden", null, children);
}

export function IxReferences({ children }: Children) {
  return createElement("ix:references", null, children);
}

export function IxResources({ children }: Children) {
  return createElement("ix:resources", null, children);
}

export function IxNonNumeric(
  props: {
    contextRef: string;
    name: string;
    continuedAt?: string;
    tupleRef?: string;
    /** Övriga iXBRL-attribut (motsvarar Vues additionalIxbrlAttrs). */
    additional?: Record<string, string>;
  } & Children,
) {
  const { children, additional, ...rest } = props;
  return createElement("ix:nonNumeric", attrs({ ...rest, ...additional }), children);
}

export function IxNonFraction(
  props: {
    contextRef: string;
    name: string;
    unitRef?: string;
    decimals?: string;
    scale?: string;
    format: string;
    sign?: string;
    tupleRef?: string;
    /** Övriga iXBRL-attribut (motsvarar Vues additionalIxbrlAttrs). */
    additional?: Record<string, string>;
  } & Children,
) {
  const { children, additional, ...rest } = props;
  return createElement(
    "ix:nonFraction",
    attrs({ ...rest, ...additional }),
    children,
  );
}

export function IxTuple(
  props: { name: string; tupleID: string } & Children,
) {
  const { children, ...rest } = props;
  return createElement("ix:tuple", attrs(rest), children);
}

export function IxContinuation(props: { id: string } & Children) {
  const { children, ...rest } = props;
  return createElement("ix:continuation", attrs(rest), children);
}

// ---- link: ----------------------------------------------------------------

export function LinkSchemaRef(props: { href: string; type?: string }) {
  return createElement("link:schemaRef", {
    "xlink:href": props.href,
    "xlink:type": props.type ?? "simple",
  });
}

// ---- xbrli: ---------------------------------------------------------------

export function XbrliContext({ id, children }: { id: string } & Children) {
  return createElement("xbrli:context", { id }, children);
}

export function XbrliEntity({ children }: Children) {
  return createElement("xbrli:entity", null, children);
}

export function XbrliIdentifier(
  props: { scheme: string } & Children,
) {
  const { children, ...attrs } = props;
  return createElement("xbrli:identifier", attrs, children);
}

export function XbrliPeriod({ children }: Children) {
  return createElement("xbrli:period", null, children);
}

export function XbrliStartDate({ children }: Children) {
  return createElement("xbrli:startDate", null, children);
}

export function XbrliEndDate({ children }: Children) {
  return createElement("xbrli:endDate", null, children);
}

export function XbrliInstant({ children }: Children) {
  return createElement("xbrli:instant", null, children);
}

export function XbrliUnit({ id, children }: { id: string } & Children) {
  return createElement("xbrli:unit", { id }, children);
}

export function XbrliMeasure({ children }: Children) {
  return createElement("xbrli:measure", null, children);
}
