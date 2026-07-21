import { useFlowStore } from "@/stores/flowStore.ts";
import { CommonValidateStep } from "@/flows/common/CommonValidateStep.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Skicka-in-flödets kontroll-steg — tunn wrapper (ingen todo-lista). */
export function StepGranska({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const ixbrl = useFlowStore((s) => s.ixbrl);
  if (!arsredovisning || !ixbrl) return null;

  return (
    <CommonValidateStep
      arsredovisning={arsredovisning}
      ixbrl={ixbrl}
      discardFaststallelseintygValidations={false}
      stepLabel={`Steg ${stepNumber}/${numSteps}: Bolagsverkets kontroller`}
      onPrevious={goPrevious}
      onCancel={cancel}
      onNext={goNext}
    />
  );
}
