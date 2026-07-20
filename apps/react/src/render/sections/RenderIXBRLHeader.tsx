import { Fragment } from "react";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import type { TaxonomyItem } from "@/model/taxonomy/TaxonomyItem.ts";
import {
  getUnitRef,
  UNIT_REF_PURE,
  UNIT_REF_REDOVISNINGSVALUTA,
  UNIT_REF_SHARES,
} from "@/util/renderUtils.ts";
import {
  IxHeader,
  IxHidden,
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

const SCHEME = "http://www.bolagsverket.se";

/**
 * Port av RenderIXBRLHeader.vue — iXBRL-huvudet (hidden metadata, referenser,
 * kontexter och enheter). decimalUnitItems (unika decimal-taxonomiobjekt över
 * alla sektioner) beräknas av föräldern som laddar taxonomierna.
 */
export function RenderIXBRLHeader(props: {
  arsredovisning: Arsredovisning;
  decimalUnitItems: TaxonomyItem[];
}) {
  const { arsredovisning, decimalUnitItems } = props;
  const { foretagsinformation, redovisningsinformation } = arsredovisning;
  const orgnr = foretagsinformation.organisationsnummer;
  const nuvarande = arsredovisning.verksamhetsarNuvarande;
  const tidigare = arsredovisning.verksamhetsarTidigare;

  const Entity = () => (
    <XbrliEntity>
      <XbrliIdentifier scheme={SCHEME}>{orgnr}</XbrliIdentifier>
    </XbrliEntity>
  );

  const openingBalanceDate =
    tidigare.length > 0
      ? tidigare[tidigare.length - 1].startdatum
      : nuvarande.startdatum;

  return (
    <div style={{ display: "none" }}>
      <IxHeader>
        <IxHidden>
          <IxNonNumeric
            contextRef="period0"
            name="se-cd-base:SprakHandlingUpprattadList"
          >
            se-mem-base:SprakSvenskaMember
          </IxNonNumeric>
          <IxNonNumeric
            contextRef="period0"
            name="se-cd-base:LandForetagetsSateList"
          >
            se-mem-base:LandSverigeMember
          </IxNonNumeric>
          <IxNonNumeric
            contextRef="period0"
            name="se-cd-base:RedovisningsvalutaHandlingList"
          >
            {redovisningsinformation.redovisningsvaluta.xbrlId}
          </IxNonNumeric>
          <IxNonNumeric
            contextRef="period0"
            name="se-gen-base:FinansiellRapportList"
          >
            {redovisningsinformation.avgivande.xbrlId}
          </IxNonNumeric>
          <IxNonNumeric
            contextRef="period0"
            name="se-cd-base:BeloppsformatList"
          >
            se-mem-base:BeloppsformatNormalformMember
          </IxNonNumeric>
          <IxNonNumeric
            contextRef="period0"
            name="se-cd-base:RakenskapsarForstaDag"
          >
            {nuvarande.startdatum}
          </IxNonNumeric>
          <IxNonNumeric
            contextRef="period0"
            name="se-cd-base:RakenskapsarSistaDag"
          >
            {nuvarande.slutdatum}
          </IxNonNumeric>
        </IxHidden>

        <IxReferences>
          <LinkSchemaRef href="http://xbrl.taxonomier.se/se/fr/gaap/k2/risbs/2021-10-31/se-k2-risbs-2021-10-31.xsd" />
          <LinkSchemaRef href="http://xbrl.taxonomier.se/se/fr/gaap/coa/rplc/2020-12-01/se-coa-rplc-2020-12-01.xsd" />
        </IxReferences>

        <IxResources>
          <XbrliContext id="period0">
            <Entity />
            <XbrliPeriod>
              <XbrliStartDate>{nuvarande.startdatum}</XbrliStartDate>
              <XbrliEndDate>{nuvarande.slutdatum}</XbrliEndDate>
            </XbrliPeriod>
          </XbrliContext>
          <XbrliContext id="balans0">
            <Entity />
            <XbrliPeriod>
              <XbrliInstant>{nuvarande.slutdatum}</XbrliInstant>
            </XbrliPeriod>
          </XbrliContext>

          {tidigare.map((ar, idx) => {
            const i = idx + 1;
            return (
              <Fragment key={i}>
                <XbrliContext id={`period${i}`}>
                  <Entity />
                  <XbrliPeriod>
                    <XbrliStartDate>{ar.startdatum}</XbrliStartDate>
                    <XbrliEndDate>{ar.slutdatum}</XbrliEndDate>
                  </XbrliPeriod>
                </XbrliContext>
                <XbrliContext id={`balans${i}`}>
                  <Entity />
                  <XbrliPeriod>
                    <XbrliInstant>{ar.slutdatum}</XbrliInstant>
                  </XbrliPeriod>
                </XbrliContext>
              </Fragment>
            );
          })}

          {tidigare.length < 3 && (
            <XbrliContext id={`balans${tidigare.length + 1}`}>
              <Entity />
              <XbrliPeriod>
                <XbrliInstant>{openingBalanceDate}</XbrliInstant>
              </XbrliPeriod>
            </XbrliContext>
          )}

          <XbrliUnit id={UNIT_REF_REDOVISNINGSVALUTA as string}>
            <XbrliMeasure>
              iso4217:{redovisningsinformation.redovisningsvaluta.kod}
            </XbrliMeasure>
          </XbrliUnit>
          <XbrliUnit id={UNIT_REF_PURE as string}>
            <XbrliMeasure>xbrli:pure</XbrliMeasure>
          </XbrliUnit>
          <XbrliUnit id={UNIT_REF_SHARES as string}>
            <XbrliMeasure>xbrli:shares</XbrliMeasure>
          </XbrliUnit>
          {decimalUnitItems.map((item) => (
            <XbrliUnit key={item.xmlName} id={getUnitRef(item) ?? ""}>
              <XbrliMeasure>se-k2-type:{item.properties.name}</XbrliMeasure>
            </XbrliUnit>
          ))}
        </IxResources>
      </IxHeader>
    </div>
  );
}
