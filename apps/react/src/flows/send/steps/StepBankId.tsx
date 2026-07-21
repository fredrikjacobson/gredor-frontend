import { useFlowStore } from "@/stores/flowStore.ts";
import { CommonBankIdStep } from "@/flows/common/CommonBankIdStep.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Skicka-in-flödets BankID-steg — tunn wrapper över CommonBankIdStep. */
export function StepBankId({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const personalNumber = useFlowStore((s) => s.personalNumber);
  const setBankIdVerified = useFlowStore((s) => s.setBankIdVerified);

  return (
    <CommonBankIdStep
      personalNumber={personalNumber}
      stepLabel={`Steg ${stepNumber}/${numSteps}: Legitimera med BankID`}
      onVerified={() => setBankIdVerified(true)}
      onPrevious={goPrevious}
      onCancel={cancel}
      onNext={goNext}
    />
  );
}
