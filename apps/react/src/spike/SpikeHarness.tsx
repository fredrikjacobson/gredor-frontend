/**
 * Fas 0-spik: bevisar i en RIKTIG webbläsare att React-renderade ix:-element
 * överlever serialisering (documentUtils-motsvarande fixTag/xmlns) och
 * convertiXBRLToXBRL (från @gredor/domain) med korrekta XBRL-fakta.
 *
 * Renderar spik-dokumentet dolt, kör pipelinen efter montering och visar
 * PASS/FAIL för varje kontroll samt den genererade iXBRL:en och XBRL:en.
 */
import { useEffect, useRef, useState } from "react";
import { convertiXBRLToXBRL } from "@/util/convertiXBRLToXBRL.ts";
import { convertHTMLToiXBRL } from "@/util/ixbrlSerializer.ts";
import { IxbrlSpikeDocument } from "@/spike/IxbrlSpikeDocument.tsx";

interface Check {
  label: string;
  pass: boolean;
  detail: string;
}

/** Öppningstaggen `<name ...>` för ett element, eller "" om det saknas. */
function openingTag(xml: string, name: string): string {
  const m = new RegExp(`<${escapeRe(name)}\\b[^>]*>`).exec(xml);
  return m ? m[0] : "";
}

/** Textinnehållet i `<name ...>TEXT</name>`, trimmat. */
function elementValue(xml: string, name: string): string | null {
  const m = new RegExp(
    `<${escapeRe(name)}\\b[^>]*>([\\s\\S]*?)</${escapeRe(name)}>`,
  ).exec(xml);
  return m ? m[1].trim() : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runChecks(xbrl: string): Check[] {
  const checks: Check[] = [];
  const add = (label: string, pass: boolean, detail: string) =>
    checks.push({ label, pass, detail });

  // 1. Versaliseringen (contextRef) överlevde React → DOM (gemener) → fixTag.
  add(
    "camelCase-attribut återställda (contextRef, inte contextref)",
    xbrl.includes('contextRef="period0"') &&
      !/contextref=/.test(xbrl) &&
      xbrl.includes('unitRef="redovisningsvaluta"'),
    xbrl.includes('contextRef="period0"') ? "contextRef/unitRef OK" : "saknas",
  );

  // 2. ix:nonFraction med scale+sign → korrekt beräknat XBRL-värde.
  const netto = elementValue(xbrl, "se-gen-base:Nettoomsattning");
  const nettoTag = openingTag(xbrl, "se-gen-base:Nettoomsattning");
  add(
    "ix:nonFraction Nettoomsättning: sign='-' + scale='3' → -1234000",
    netto === "-1234000" &&
      nettoTag.includes('unitRef="redovisningsvaluta"') &&
      nettoTag.includes('decimals="0"'),
    `värde=${netto}; tagg=${nettoTag || "(saknas)"}`,
  );

  // 3. ix:nonFraction utan sign, scale='0' → oförändrat värde.
  const rr = elementValue(xbrl, "se-gen-base:Rorelseresultat");
  add(
    "ix:nonFraction Rörelseresultat: scale='0', inget tecken → 5678",
    rr === "5678",
    `värde=${rr}`,
  );

  // 4. ix:nonNumeric (strängvärde) bevaras.
  const enumVal = elementValue(xbrl, "se-cd-base:BeloppsformatList");
  add(
    "ix:nonNumeric BeloppsformatList → medlemsvärde",
    enumVal === "se-mem-base:BeloppsformatNormalformMember",
    `värde=${enumVal}`,
  );

  // 5. xbrli:context kopierad från ix:resources med rätt period/entity.
  const ctxTag = openingTag(xbrl, "xbrli:context");
  add(
    "xbrli:context period0 med entity + period",
    ctxTag.includes('id="period0"') &&
      xbrl.includes("2024-01-01") &&
      xbrl.includes("2024-12-31") &&
      xbrl.includes("5560000000"),
    ctxTag || "(saknas)",
  );

  // 6. xbrli:unit kopierad med measure.
  add(
    "xbrli:unit redovisningsvaluta med measure iso4217:SEK",
    /<xbrli:unit\b[^>]*id="redovisningsvaluta"/.test(xbrl) &&
      xbrl.includes("iso4217:SEK"),
    "unit + measure",
  );

  // 7. link:schemaRef kopierad från ix:references.
  add(
    "link:schemaRef med xlink:href bevarad",
    xbrl.includes("se-k2-risbs-2021-10-31.xsd") &&
      /xlink:href=/.test(xbrl),
    "schemaRef",
  );

  return checks;
}

export function SpikeHarness() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ixbrl, setIxbrl] = useState<string>("");
  const [xbrl, setXbrl] = useState<string>("");
  const [checks, setChecks] = useState<Check[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    void (async () => {
      try {
        if (!containerRef.current) return;
        // Spiken isolerar ix:-mekanismen från CSS: tom CSS-insamlare. Detta kör
        // ändå den delade transformkärnan (convertHTMLToiXBRL) på React-input.
        const generatedIxbrl = await convertHTMLToiXBRL(containerRef.current, {
          title: "Spik",
          programVersion: __APP_VERSION__,
          collectUsedCss: async () => "",
        });
        const generatedXbrl = convertiXBRLToXBRL(generatedIxbrl);
        setIxbrl(generatedIxbrl);
        setXbrl(generatedXbrl);
        setChecks(runChecks(generatedXbrl));
      } catch (e) {
        setError(e instanceof Error ? `${e.message}\n${e.stack}` : String(e));
      }
    })();
  }, []);

  const allPass = checks.length > 0 && checks.every((c) => c.pass);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Fas 0 — iXBRL-renderingsspik (React)</h1>

      {/* Dolt spik-dokument, källa för innerHTML. */}
      <div ref={containerRef} style={{ position: "absolute", left: -99999 }}>
        <IxbrlSpikeDocument />
      </div>

      {error ? (
        <pre
          data-testid="spike-error"
          style={{ color: "#b00", whiteSpace: "pre-wrap" }}
        >
          {error}
        </pre>
      ) : (
        <>
          <p
            data-testid="spike-verdict"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: allPass ? "#1a7f37" : "#b00",
            }}
          >
            {allPass ? "✓ ALLA KONTROLLER GODKÄNDA" : "✗ NÅGON KONTROLL MISSLYCKADES"}
          </p>
          <ul>
            {checks.map((c) => (
              <li key={c.label} style={{ marginBottom: 6 }}>
                <strong style={{ color: c.pass ? "#1a7f37" : "#b00" }}>
                  {c.pass ? "PASS" : "FAIL"}
                </strong>{" "}
                — {c.label}
                <div style={{ color: "#666", fontSize: 12 }}>{c.detail}</div>
              </li>
            ))}
          </ul>

          <details>
            <summary>Genererad XBRL</summary>
            <pre style={{ background: "#f6f6f6", padding: 12, overflow: "auto" }}>
              {xbrl}
            </pre>
          </details>
          <details>
            <summary>Genererad iXBRL</summary>
            <pre style={{ background: "#f6f6f6", padding: 12, overflow: "auto" }}>
              {ixbrl}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
