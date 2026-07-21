import { useNavigate } from "@tanstack/react-router";
import { useFinalizeStore } from "@/stores/finalizeStore.ts";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { FinalizeStepProps } from "@/flows/finalize/steps/FinalizeStepProps.ts";

/** Port av FinalizeFinish.vue — redo för årsstämma. "Klar" återgår till editorn. */
export function StepFinish({
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const navigate = useNavigate();
  const reset = useFinalizeStore((s) => s.reset);

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Redo för årsstämma!
      </p>

      <p className="text-sm text-ink-medium">
        Har du signerat årsredovisningen? I så fall är företaget redo för
        årsstämma! Efter årsstämman kan du använda Gredor-funktionen "Ladda upp
        till Bolagsverket efter årsstämma" för att gå vidare med inlämningen.
      </p>

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={() => {
          reset();
          void navigate({ to: "/redigera" });
        }}
        nextLabel="Klar"
      />
    </div>
  );
}
