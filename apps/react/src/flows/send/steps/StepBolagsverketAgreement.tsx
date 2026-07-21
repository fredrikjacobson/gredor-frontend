import { useFlowStore } from "@/stores/flowStore.ts";
import { CommonBolagsverketAgreementStep } from "@/flows/common/CommonBolagsverketAgreementStep.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Skicka-in-flödets Bolagsverket-avtalssteg — tunn wrapper. */
export function StepBolagsverketAgreement({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  if (!arsredovisning) return null;

  return (
    <CommonBolagsverketAgreementStep
      arsredovisning={arsredovisning}
      stepLabel={`Steg ${stepNumber}/${numSteps}: Information från Bolagsverket`}
      onPrevious={goPrevious}
      onCancel={cancel}
      onNext={goNext}
    />
  );
}
