import { useEffect, useRef, useState } from "react";
import { useFlowStore } from "@/stores/flowStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { serializeReactHTMLToiXBRL } from "@/ix/serializeIxbrl.ts";
import { RENDER_FONT_FAMILY_WHITELIST } from "@/util/renderUtils.ts";
import { getAppFullVersion, getConfigValue } from "@/util/configUtils.ts";
import { requestSaveFile } from "@/util/fileUtils.ts";
import { ArsredovisningPreview } from "@/render/ArsredovisningPreview.tsx";
import { Button } from "@/components/ui/button.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Port av SendGenerateReport.vue + useIXBRLGenerator.ts — renderar hela
 * årsredovisningen (med fastställelseintyg) och serialiserar den till iXBRL i
 * bakgrunden. Resultatet lagras i flowStore och driver resten av flödet.
 */
export function StepGenerera({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const ixbrl = useFlowStore((s) => s.ixbrl);
  const setIxbrl = useFlowStore((s) => s.setIxbrl);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Förbereder…");

  useEffect(() => {
    if (!arsredovisning) return;
    setIxbrl(null);
    let cancelled = false;
    let tries = 0;

    // Prova var 250:e ms tills förhandsgranskningens tabeller finns, serialisera
    // sedan .arsredovisning-root:s innerHTML — precis som Vue-generatorn.
    const tick = async () => {
      if (cancelled) return;
      const root = containerRef.current?.querySelector(".arsredovisning-root");
      const ready = root && root.querySelectorAll("table").length > 0;
      if (!ready) {
        if (tries++ > 200) {
          setStatus("Timeout: förhandsgranskningen renderades aldrig");
          return;
        }
        setTimeout(() => void tick(), 250);
        return;
      }
      try {
        setStatus("Skapar iXBRL…");
        const { foretagsinformation } = arsredovisning;
        const result = await serializeReactHTMLToiXBRL(root as HTMLElement, {
          title: `${foretagsinformation.organisationsnummer} ${foretagsinformation.foretagsnamn} - Årsredovisning`,
          programVersion: getAppFullVersion(),
          fontFamilyWhitelist: RENDER_FONT_FAMILY_WHITELIST,
          requireFonts: true,
        });
        if (!cancelled) {
          setIxbrl(result);
          setStatus("Klar");
        }
      } catch (e) {
        const details = e instanceof Error ? e.message : "Unknown error";
        showMessageModal(
          `Det gick inte att skapa dokumentet.\n\nSkulle felet fortsatt uppstå, mejla gredor@potatiz.com och uppge följande felmeddelande: ${details}`,
          "Fel",
        );
        setStatus("Fel vid generering");
      }
    };

    // Kort fördröjning så förhandsgranskningen hinner monteras.
    const timer = setTimeout(() => void tick(), 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!arsredovisning) return null;

  const testMode = getConfigValue("VITE_TEST_MODE") === "true";

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Förhandsgranska årsredovisningen
      </p>
      <p className="mb-4 text-sm text-ink-medium">
        Observera att det är Bolagsverket som skapar det slutgiltiga dokumentet,
        och att det eventuellt kan se lite annorlunda ut.
      </p>

      <div className="max-h-[60vh] overflow-auto rounded-lg border border-line bg-surface p-2">
        <div ref={containerRef}>
          <ArsredovisningPreview
            arsredovisning={arsredovisning}
            showFaststallelseintyg
          />
        </div>
      </div>

      {!ixbrl && (
        <p className="mt-3 text-sm text-ink-light" data-testid="send-wizard-generate-status">
          {status}
        </p>
      )}

      {testMode && (
        <Button
          variant="outline"
          className="mt-3"
          disabled={!ixbrl}
          data-testid="send-wizard-export-ixbrl"
          onClick={() => {
            if (ixbrl)
              requestSaveFile(ixbrl, "arsredovisning.xhtml", "text/html");
          }}
        >
          Exportera iXBRL-fil (test)
        </Button>
      )}

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={!ixbrl}
        nextLabel={ixbrl ? "Nästa" : "Vänta – arbetar i bakgrunden…"}
      />
    </div>
  );
}
