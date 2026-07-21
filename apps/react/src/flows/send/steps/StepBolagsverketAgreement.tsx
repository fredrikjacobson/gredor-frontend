import { useEffect, useState } from "react";
import { useFlowStore } from "@/stores/flowStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { usePrepareSubmission } from "@/api/useSubmissionFlow.ts";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import { AgreementCheckbox } from "@/flows/send/steps/AgreementCheckbox.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Port av CommonBolagsverketAgreement.vue — hämtar Bolagsverkets avtalstext via
 * submission-flow/prepare och kräver att användaren godkänner villkoren.
 */
export function StepBolagsverketAgreement({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const prepare = usePrepareSubmission();
  const [userAgreed, setUserAgreed] = useState(false);

  useEffect(() => {
    if (!arsredovisning) return;
    prepare.mutate(arsredovisning, {
      onError: (e) =>
        showMessageModal(
          e instanceof Error ? `Teknisk information: ${e.message}` : String(e),
          "Fel vid kommunikation med Bolagsverket",
        ),
    });
    // Kör en gång vid montering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avtalstext = prepare.data?.avtalstext;
  const lines = avtalstext
    ? avtalstext.split(/\r?\n/).filter((l) => l.trim().length > 0)
    : [];

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Information från Bolagsverket
      </p>

      {prepare.isPending && <div>Laddar…</div>}

      {lines.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-2 text-sm text-ink-medium">
            {lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <AgreementCheckbox
              id="bolagsverketAgreementCheck"
              checked={userAgreed}
              onChange={setUserAgreed}
              label="Jag godkänner Bolagsverkets villkor"
            />
          </div>
        </div>
      )}

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={!userAgreed}
      />
    </div>
  );
}
