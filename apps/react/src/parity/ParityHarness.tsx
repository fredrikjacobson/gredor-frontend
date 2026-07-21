import { useEffect, useRef, useState } from "react";
import { XMLParser } from "fast-xml-parser";
import { diff } from "json-diff-ts";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { serializeReactHTMLToiXBRL } from "@/ix/serializeIxbrl.ts";
import { RENDER_FONT_FAMILY_WHITELIST } from "@/util/renderUtils.ts";
import { convertiXBRLToXBRL } from "@/util/convertiXBRLToXBRL.ts";
import { ResultatdispositionBeslutGodkannaVinst } from "@/data/faststallelseintyg.ts";
import { ArsredovisningPreview } from "@/render/ArsredovisningPreview.tsx";

// Fastställelseintygsfälten matas in i skicka-flödets wizard (finns ej i
// .gredorfardig-filen). Injicera samma värden som Cypress-fallet för TestfilD.
function withTestfilDFaststallelseintyg(ar: Arsredovisning): Arsredovisning {
  return {
    ...ar,
    faststallelseintyg: {
      ...ar.faststallelseintyg,
      datumArsstamma: "2025-09-27",
      resultatdispositionBeslut: ResultatdispositionBeslutGodkannaVinst,
      underskrift: {
        tilltalsnamn: "Karl",
        efternamn: "Karlsson",
        roll: "Styrelseledamot",
        datum: "2025-09-27",
      },
    },
  };
}

/**
 * Fakta-nivå parity-sele: renderar hela förhandsgranskningen för en fixtur,
 * serialiserar den till iXBRL, konverterar till XBRL och jämför fakta mot den
 * förväntade XML:en med samma json-diff-ts-orakel som xbrloutput.cy.ts.
 * Visar exakt vilka fakta som saknas/skiljer — driver kvarvarande render-port.
 */
export function ParityHarness() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [arsredovisning, setArsredovisning] = useState<Arsredovisning | null>(
    null,
  );
  const [status, setStatus] = useState("Laddar fixtur…");
  const [result, setResult] = useState<{
    diffCount: number;
    topChanges: { type: string; key: string }[];
    cssBytes: number;
    hasFontFace: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  // Ladda fixtur.
  useEffect(() => {
    fetch("/devfixtures/testfild.json")
      .then((r) => r.json())
      .then((file) => {
        setArsredovisning(withTestfilDFaststallelseintyg(file.data));
        setStatus("Renderar förhandsgranskning…");
      })
      .catch((e) => setError(String(e)));
  }, []);

  // När fixturen är renderad (taxonomier laddade → tabeller finns), jämför.
  useEffect(() => {
    if (!arsredovisning) return;
    let cancelled = false;
    let tries = 0;

    const tick = async () => {
      if (cancelled) return;
      const root = containerRef.current?.querySelector(".arsredovisning-root");
      const ready = root && root.querySelectorAll("table").length > 0;
      if (!ready) {
        if (tries++ > 100) {
          setError("Timeout: förhandsgranskningen renderades aldrig");
          return;
        }
        setTimeout(tick, 100);
        return;
      }

      try {
        setStatus("Serialiserar + jämför…");
        // Serialisera .arsredovisning-root:s innerHTML — exakt som Vue
        // (getArsredovisningRoot). Riktig CSS-insamling + inbäddade typsnitt.
        const ixbrl = await serializeReactHTMLToiXBRL(root as HTMLElement, {
          title: "Parity",
          programVersion: "Gredor-1.7.11", // matcha inte krävs för fakta-diff
          fontFamilyWhitelist: RENDER_FONT_FAMILY_WHITELIST,
          requireFonts: true,
        });
        (window as unknown as { __ixbrl?: string }).__ixbrl = ixbrl;

        // Sammanfatta den insamlade dokument-CSS:en för synlig sanity-check.
        const styleMatch = /<style[^>]*>([\s\S]*?)<\/style>/.exec(ixbrl);
        const cssBytes = styleMatch ? styleMatch[1].length : 0;
        const hasFontFace = /@font-face/.test(styleMatch?.[1] ?? "");
        const actualXbrl = convertiXBRLToXBRL(ixbrl);
        const expectedXml = await (
          await fetch("/devfixtures/testfild-expected.xml")
        ).text();

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          allowBooleanAttributes: true,
          preserveOrder: false,
        });
        const diffs = diff(
          parser.parse(expectedXml),
          parser.parse(actualXbrl),
          {
            embeddedObjKeys: {
              ".xbrli:xbrl.xbrli:context": "@_id",
              ".xbrli:xbrl.xbrli:unit": "@_id",
            },
          },
        );

        // Platta ut ändringarna till (typ, nyckel)-par för överblick.
        const flat: { type: string; key: string }[] = [];
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

        if (!cancelled) {
          setResult({
            diffCount: flat.length,
            topChanges: flat.slice(0, 40),
            cssBytes,
            hasFontFace,
          });
          setStatus(flat.length === 0 ? "PARITY OK" : "Skillnader hittade");
        }
      } catch (e) {
        setError(e instanceof Error ? `${e.message}\n${e.stack}` : String(e));
      }
    };

    void tick();
    return () => {
      cancelled = true;
    };
  }, [arsredovisning]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Parity — TestfilD (fakta-nivå)</h1>
      <p data-testid="parity-status" style={{ fontWeight: 700 }}>
        {status}
      </p>
      {error && (
        <pre style={{ color: "#b00", whiteSpace: "pre-wrap" }}>{error}</pre>
      )}
      {result && (
        <div>
          <p
            data-testid="parity-diffcount"
            style={{
              fontSize: 20,
              color: result.diffCount === 0 ? "#1a7f37" : "#b00",
            }}
          >
            {result.diffCount} skillnader
          </p>
          <p data-testid="parity-css" style={{ fontSize: 13 }}>
            Dokument-CSS: {result.cssBytes} tecken ·{" "}
            {result.hasFontFace ? "@font-face inbäddat ✓" : "INGA typsnitt ✗"}
          </p>
          <ol style={{ fontSize: 12 }}>
            {result.topChanges.map((c, i) => (
              <li key={i}>
                <code>
                  [{c.type}] {c.key}
                </code>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Dold render av hela årsredovisningen (källa för serialisering). */}
      <div
        ref={containerRef}
        style={{ position: "absolute", left: -99999, top: 0 }}
      >
        {arsredovisning && (
          <ArsredovisningPreview
            arsredovisning={arsredovisning}
            showFaststallelseintyg
          />
        )}
      </div>
    </div>
  );
}
