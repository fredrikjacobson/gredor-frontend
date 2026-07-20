import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { IxNonNumeric, IxTuple } from "@/ix/ix.tsx";

/** Port av RenderUnderskrifter.vue — ort/datum + underskrifter som tuples. */
export function RenderUnderskrifter(props: { arsredovisning: Arsredovisning }) {
  const { redovisningsinformation, verksamhetsarNuvarande } =
    props.arsredovisning;
  const underskrifter = redovisningsinformation.underskrifter;

  // Datum visas endast för vissa räkenskapsårsperioder (samma villkor som Vue).
  const showDatum =
    new Date(verksamhetsarNuvarande.slutdatum) < new Date("2021-12-31") ||
    new Date(verksamhetsarNuvarande.startdatum) >= new Date("2024-07-01");

  return (
    <div className="signatures-container">
      <p className="ort-datum">
        <IxNonNumeric
          contextRef="period0"
          name="se-gen-base:UndertecknandeArsredovisningOrt"
        >
          {redovisningsinformation.undertecknandeOrt}
        </IxNonNumeric>
        {showDatum && (
          <>
            {" "}
            <IxNonNumeric
              contextRef="period0"
              name="se-gen-base:UndertecknandeArsredovisningDatum"
            >
              {redovisningsinformation.datering}
            </IxNonNumeric>
          </>
        )}
      </p>

      {underskrifter.map((_, index) => (
        <IxTuple
          key={index}
          tupleID={`UnderskriftArsredovisningForetradareTuple${index}`}
          name="se-gaap-ext:UnderskriftArsredovisningForetradareTuple"
        />
      ))}

      <div>
        {underskrifter.map((underskrift, index) => {
          const tupleRef = `UnderskriftArsredovisningForetradareTuple${index}`;
          return (
            <div key={index} className="name">
              <span className="signature">
                {underskrift.tilltalsnamn} {underskrift.efternamn}
              </span>
              <br />
              <IxNonNumeric
                tupleRef={tupleRef}
                contextRef="period0"
                name="se-gen-base:UnderskriftHandlingTilltalsnamn"
                additional={{ order: "1" }}
              >
                {underskrift.tilltalsnamn}
              </IxNonNumeric>{" "}
              <IxNonNumeric
                tupleRef={tupleRef}
                contextRef="period0"
                name="se-gen-base:UnderskriftHandlingEfternamn"
                additional={{ order: "2" }}
              >
                {underskrift.efternamn}
              </IxNonNumeric>
              <br />
              {underskrift.roll && (
                <IxNonNumeric
                  tupleRef={tupleRef}
                  contextRef="period0"
                  name="se-gen-base:UnderskriftHandlingRoll"
                  additional={{ order: "3" }}
                >
                  {underskrift.roll}
                </IxNonNumeric>
              )}
              <br />
              <IxNonNumeric
                tupleRef={tupleRef}
                contextRef="period0"
                name="se-gen-base:UndertecknandeDatum"
                additional={{ order: "4" }}
              >
                {underskrift.datum}
              </IxNonNumeric>
            </div>
          );
        })}
      </div>
    </div>
  );
}
