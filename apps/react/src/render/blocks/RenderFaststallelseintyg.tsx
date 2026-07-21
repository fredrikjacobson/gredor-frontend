import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import {
  isFaststallseintygRequiresStammansResultatdisposition,
  RESULTATDISPOSITION_STAMMANS_DEFINITIONS,
} from "@/data/faststallelseintyg.ts";
import { IxContinuation, IxNonNumeric } from "@/ix/ix.tsx";
import { RenderFaststallelseintygResultatdispositionStammansPart } from "@/render/blocks/RenderFaststallelseintygResultatdispositionStammansPart.tsx";

/** Port av RenderFaststallelseintyg.vue. */
export function RenderFaststallelseintyg(props: {
  arsredovisning: Arsredovisning;
}) {
  const { faststallelseintyg } = props.arsredovisning;

  const allBelopp = RESULTATDISPOSITION_STAMMANS_DEFINITIONS.map(
    (d) => faststallelseintyg.resultatdispositionStammans[d.key],
  );
  const allXmlNames = RESULTATDISPOSITION_STAMMANS_DEFINITIONS.map(
    (d) => d.xbrlId,
  );

  return (
    <div className="faststallelseintyg">
      <h2>Fastställelseintyg</h2>
      <p>
        <IxNonNumeric
          contextRef="balans0"
          continuedAt="intygande_forts"
          name="se-bol-base:ArsstammaIntygande"
        >
          <IxNonNumeric
            contextRef="balans0"
            name="se-bol-base:FaststallelseResultatBalansrakning"
          >
            Jag intygar att resultaträkningen och balansräkningen har fastställts
            på årsstämma
          </IxNonNumeric>{" "}
          <IxNonNumeric contextRef="balans0" name="se-bol-base:Arsstamma">
            {faststallelseintyg.datumArsstamma}
          </IxNonNumeric>
          .{" "}
          <br />
          <IxNonNumeric
            name={faststallelseintyg.resultatdispositionBeslut.xbrlId}
            contextRef="balans0"
          >
            {faststallelseintyg.resultatdispositionBeslut.text}
          </IxNonNumeric>
          {isFaststallseintygRequiresStammansResultatdisposition(
            faststallelseintyg,
          ) && (
            <>
              {" "}
              <IxNonNumeric
                contextRef="balans0"
                name="se-bol-base:ArsstammaResultatDispositionBeslutstext"
              >
                Istället beslöt årsstämman{" "}
                {RESULTATDISPOSITION_STAMMANS_DEFINITIONS.map((definition) => (
                  <RenderFaststallelseintygResultatdispositionStammansPart
                    key={definition.key}
                    allStammansDispositionPartBelopp={allBelopp}
                    allStammansDispositionPartXmlNames={allXmlNames}
                    belopp={
                      faststallelseintyg.resultatdispositionStammans[
                        definition.key
                      ]
                    }
                    textAfter={definition.textAfter}
                    textBefore={definition.textBefore}
                    xbrlId={definition.xbrlId}
                  />
                ))}
              </IxNonNumeric>
            </>
          )}
        </IxNonNumeric>
      </p>
      <p>
        <IxContinuation id="intygande_forts">
          <IxNonNumeric
            contextRef="balans0"
            name="se-bol-base:IntygandeOriginalInnehall"
          >
            Jag intygar att innehållet i dessa elektroniska handlingar
            överensstämmer med originalen och att originalen undertecknats av
            samtliga personer som enligt lag ska underteckna dessa.
          </IxNonNumeric>
        </IxContinuation>
      </p>
      <p>
        <span className="signature-header">
          <IxNonNumeric
            contextRef="balans0"
            name="se-bol-base:UnderskriftFaststallelseintygElektroniskt"
          >
            Elektroniskt underskriven av
          </IxNonNumeric>
          :
        </span>
        <br />
        <IxNonNumeric
          contextRef="period0"
          name="se-bol-base:UnderskriftFaststallelseintygForetradareTilltalsnamn"
        >
          {faststallelseintyg.underskrift.tilltalsnamn}
        </IxNonNumeric>{" "}
        <IxNonNumeric
          contextRef="period0"
          name="se-bol-base:UnderskriftFaststallelseintygForetradareEfternamn"
        >
          {faststallelseintyg.underskrift.efternamn}
        </IxNonNumeric>
        ,{" "}
        <IxNonNumeric
          contextRef="period0"
          name="se-bol-base:UnderskriftFaststallelseintygForetradareForetradarroll"
        >
          {faststallelseintyg.underskrift.roll}
        </IxNonNumeric>
        <br />
        <IxNonNumeric
          contextRef="balans0"
          name="se-bol-base:UnderskriftFastallelseintygDatum"
          additional={{ id: "ID_DATUM_UNDERTECKNANDE_FASTSTALLELSEINTYG" }}
        >
          {new Date().toISOString().split("T")[0]}
        </IxNonNumeric>
      </p>
    </div>
  );
}
