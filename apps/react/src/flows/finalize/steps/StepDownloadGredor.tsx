import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { useFinalizeStore } from "@/stores/finalizeStore.ts";
import { requestSaveFile } from "@/util/fileUtils.ts";
import { formatDateForFilename } from "@/util/formatUtils.ts";
import type { DataContainer } from "@/model/DataContainer.ts";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { Button } from "@/components/ui/button.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { FinalizeStepProps } from "@/flows/finalize/steps/FinalizeStepProps.ts";

/** Port av FinalizeDownloadGredor.vue — ladda ner .gredorfardig-filen. */
export function StepDownloadGredor({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const hasDownloaded = useFinalizeStore((s) => s.hasDownloadedGredorfardig);
  const setHasDownloaded = useFinalizeStore((s) => s.setHasDownloadedGredorfardig);

  if (!arsredovisning) return null;

  const exportGredorfardig = () => {
    const container: DataContainer<Arsredovisning> = {
      dataType: "arsredovisning_fardig",
      version: 1,
      data: arsredovisning,
    };
    requestSaveFile(
      JSON.stringify(container),
      `Arsredovisning_${formatDateForFilename(new Date())}.gredorfardig`,
      "application/json",
    );
    setHasDownloaded(true);
  };

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Ladda ner .gredorfardig-fil
      </p>

      <div className="rounded-lg border border-line p-4">
        <div className="flex h-20 items-center justify-center">
          <Button onClick={exportGredorfardig} data-testid="finalize-download-gredor">
            Ladda ner .gredorfardig-fil
          </Button>
        </div>
        <p className="text-sm text-ink-medium">
          Du kommer behöva .gredorfardig-filen senare när du laddar upp
          årsredovisningen till Bolagsverket.
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
