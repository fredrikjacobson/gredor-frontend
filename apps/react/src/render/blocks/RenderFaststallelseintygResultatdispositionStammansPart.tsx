import { formatNumber } from "@/util/formatUtils.ts";
import { BeloppFormat } from "@/model/arsredovisning/BeloppFormat.ts";
import { IxNonFraction } from "@/ix/ix.tsx";

/**
 * Port av RenderFaststallelseintygResultatdispositionStammansPart.vue — en del
 * av stämmans resultatdisposition med rätt skiljetecken efter beloppet.
 */
export function RenderFaststallelseintygResultatdispositionStammansPart(props: {
  xbrlId: string;
  textBefore: string;
  textAfter: string;
  belopp?: string;
  allStammansDispositionPartXmlNames: string[];
  allStammansDispositionPartBelopp: (string | undefined)[];
}) {
  const {
    xbrlId,
    textBefore,
    textAfter,
    belopp,
    allStammansDispositionPartXmlNames,
    allStammansDispositionPartBelopp,
  } = props;

  if (!belopp) return null;

  const currentIndex = allStammansDispositionPartXmlNames.indexOf(xbrlId);
  const remaining = allStammansDispositionPartBelopp
    .slice(currentIndex + 1)
    .filter((b) => b);
  const separator =
    remaining.length >= 2 ? ", " : remaining.length === 1 ? " och " : ".";

  return (
    <>
      {textBefore}{" "}
      <IxNonFraction
        name={xbrlId}
        contextRef="balans0"
        decimals="INF"
        format="ixt:numspacecomma"
        scale="0"
        unitRef="redovisningsvaluta"
      >
        {formatNumber(belopp, null, BeloppFormat.HELTAL)}
      </IxNonFraction>
      {textAfter}
      {separator}
    </>
  );
}
