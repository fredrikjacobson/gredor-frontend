import { useFinalizeStore } from "@/stores/finalizeStore.ts";
import { printDocument } from "@/util/documentUtils.ts";
import { Button } from "@/components/ui/button.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { FinalizeStepProps } from "@/flows/finalize/steps/FinalizeStepProps.ts";

/** Port av FinalizeDownloadReport.vue — skriv ut / spara årsredovisningen som PDF. */
export function StepDownloadReport({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const ixbrl = useFinalizeStore((s) => s.ixbrl);
  const hasDownloaded = useFinalizeStore((s) => s.hasDownloadedPdf);
  const setHasDownloaded = useFinalizeStore((s) => s.setHasDownloadedPdf);

  const exportUnsignedPdf = () => {
    if (!ixbrl) return;
    printDocument(ixbrl);
    setHasDownloaded(true);
  };

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Skriv ut och signera
      </p>

      <div className="rounded-lg border border-line p-4">
        <div className="flex h-20 items-center justify-center">
          <Button
            onClick={exportUnsignedPdf}
            disabled={!ixbrl}
            data-testid="finalize-download-pdf"
          >
            Skriv ut eller spara årsredovisningen
          </Button>
        </div>
        <p className="text-sm text-ink-medium">
          Efter att du har skrivit ut årsredovisningen är det{" "}
          <strong>mycket viktigt</strong> att du signerar den. Gredors
          rekommendation är att skriva ut årsredovisningen till en PDF-fil och
          sedan använda gratistjänsten{" "}
          <a
            className="font-bold text-primary"
            href="https://elektronisksignering.se/"
            target="_blank"
            rel="noreferrer"
          >
            elektronisksignering.se
          </a>{" "}
          för att signera den digitalt (men du kan också skriva ut den på papper
          och signera för hand).
        </p>
      </div>

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={!hasDownloaded}
      />
    </div>
  );
}
