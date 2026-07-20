import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { IxNonNumeric } from "@/ix/ix.tsx";

/**
 * Port av RenderCover.vue — försättsbladet. Fastställelseintyget är ännu inte
 * porterat (RenderFaststallelseintyg); visas därför inte.
 */
export function RenderCover(props: {
  arsredovisning: Arsredovisning;
  showFaststallelseintyg: boolean;
}) {
  const { arsredovisning } = props;
  const { foretagsinformation, redovisningsinformation, verksamhetsarNuvarande } =
    arsredovisning;

  const startAr = verksamhetsarNuvarande.startdatum.trim().split("-")[0];
  const slutAr = verksamhetsarNuvarande.slutdatum.trim().split("-")[0];
  const rakenskapsarText = startAr === slutAr ? startAr : `${startAr}–${slutAr}`;

  const logo = foretagsinformation.logotyp;
  const logoClass = [
    "logo",
    logo.placering === "vänster" ? "left" : "",
    logo.placering === "höger" ? "right" : "",
    logo.placering === "topp" ? "top" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="cover">
      {logo.base64 && <img className={logoClass} src={logo.base64} alt="" />}

      <div>
        <IxNonNumeric contextRef="period0" name="se-cd-base:ForetagetsNamn">
          {foretagsinformation.foretagsnamn}
        </IxNonNumeric>
        <br />
        <abbr>Org.nr</abbr>{" "}
        <IxNonNumeric
          contextRef="period0"
          name="se-cd-base:Organisationsnummer"
        >
          {foretagsinformation.organisationsnummer}
        </IxNonNumeric>
      </div>

      <h1>Årsredovisning för räkenskapsåret {rakenskapsarText}</h1>

      <p>
        {redovisningsinformation.avgivande.namn} avger härmed följande
        årsredovisning
        <br />
        för räkenskapsåret {verksamhetsarNuvarande.startdatum} –{" "}
        {verksamhetsarNuvarande.slutdatum}.
      </p>

      <p className="currency-info">
        Om inte annat särskilt anges, redovisas alla belopp i hela{" "}
        {redovisningsinformation.redovisningsvaluta.namn}.
      </p>
    </div>
  );
}
