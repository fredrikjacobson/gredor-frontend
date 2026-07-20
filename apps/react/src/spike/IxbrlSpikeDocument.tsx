/**
 * En minimal årsredovisnings-fragment renderad helt med ix/-fabriken, med
 * HÅRDKODADE värden så att förväntad XBRL kan räknas ut för hand. Syftet är att
 * bevisa att React kan emittera ix:/xbrli:/link:-element som överlever
 * serialisering + convertiXBRLToXBRL med rätt fakta.
 *
 * Motsvarar (i miniatyr) RenderIXBRLHeader + RenderResultatrakning + belopprads-
 * cellerna i Vue-appen.
 */
import {
  IxHeader,
  IxHidden,
  IxNonFraction,
  IxNonNumeric,
  IxReferences,
  IxResources,
  LinkSchemaRef,
  XbrliContext,
  XbrliEndDate,
  XbrliEntity,
  XbrliIdentifier,
  XbrliInstant,
  XbrliMeasure,
  XbrliPeriod,
  XbrliStartDate,
  XbrliUnit,
} from "@/ix/ix.tsx";

const ORGNR = "5560000000";
const SCHEME = "http://www.bolagsverket.se";

export function IxbrlSpikeDocument() {
  return (
    <div className="arsredovisning-root">
      <div style={{ display: "none" }}>
        <IxHeader>
          <IxHidden>
            <IxNonNumeric
              contextRef="period0"
              name="se-cd-base:BeloppsformatList"
            >
              se-mem-base:BeloppsformatNormalformMember
            </IxNonNumeric>
          </IxHidden>
          <IxReferences>
            <LinkSchemaRef href="http://xbrl.taxonomier.se/se/fr/gaap/k2/risbs/2021-10-31/se-k2-risbs-2021-10-31.xsd" />
            <LinkSchemaRef href="http://xbrl.taxonomier.se/se/fr/gaap/coa/rplc/2020-12-01/se-coa-rplc-2020-12-01.xsd" />
          </IxReferences>
          <IxResources>
            <XbrliContext id="period0">
              <XbrliEntity>
                <XbrliIdentifier scheme={SCHEME}>{ORGNR}</XbrliIdentifier>
              </XbrliEntity>
              <XbrliPeriod>
                <XbrliStartDate>2024-01-01</XbrliStartDate>
                <XbrliEndDate>2024-12-31</XbrliEndDate>
              </XbrliPeriod>
            </XbrliContext>
            <XbrliContext id="balans0">
              <XbrliEntity>
                <XbrliIdentifier scheme={SCHEME}>{ORGNR}</XbrliIdentifier>
              </XbrliEntity>
              <XbrliPeriod>
                <XbrliInstant>2024-12-31</XbrliInstant>
              </XbrliPeriod>
            </XbrliContext>
            <XbrliUnit id="redovisningsvaluta">
              <XbrliMeasure>iso4217:SEK</XbrliMeasure>
            </XbrliUnit>
            <XbrliUnit id="pure">
              <XbrliMeasure>xbrli:pure</XbrliMeasure>
            </XbrliUnit>
          </IxResources>
        </IxHeader>
      </div>

      <table className="belopprad-table">
        <tbody>
          <tr>
            <td>Nettoomsättning</td>
            <td className="value-container">
              {/* Negativt värde: minustecknet visas som text, men själva
                  ix:nonFraction-värdet är osignerat och sign="-" bär tecknet.
                  scale=3 (tusental) → värdet multipliceras med 1000. */}
              <span>&minus;</span>
              <IxNonFraction
                contextRef="period0"
                name="se-gen-base:Nettoomsattning"
                unitRef="redovisningsvaluta"
                decimals="0"
                scale="3"
                sign="-"
                format="ixt:numspacecomma"
              >
                1 234
              </IxNonFraction>
            </td>
          </tr>
          <tr>
            <td>Rörelseresultat</td>
            <td className="value-container">
              <IxNonFraction
                contextRef="period0"
                name="se-gen-base:Rorelseresultat"
                unitRef="redovisningsvaluta"
                decimals="0"
                scale="0"
                format="ixt:numspacecomma"
              >
                5 678
              </IxNonFraction>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
