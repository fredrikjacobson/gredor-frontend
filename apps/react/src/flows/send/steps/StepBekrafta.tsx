import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Port av SendFinalConfirmation.vue — slutgiltig bekräftelse inför uppladdning. */
export function StepBekrafta({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Bekräfta överföring
      </p>

      <p className="text-sm text-ink-medium">
        Du är på väg att ladda upp årsredovisningen till ditt egna utrymme hos
        Bolagsverket.{" "}
        <strong className="text-ink underline">
          Observera att årsredovisningen inte är mottagen av Bolagsverket förrän
          du har signerat den i deras e-tjänst.
        </strong>
      </p>

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextLabel="Ladda upp"
      />
    </div>
  );
}
