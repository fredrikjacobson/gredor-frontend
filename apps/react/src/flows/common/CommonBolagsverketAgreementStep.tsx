import { useEffect, useState } from "react";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { usePrepareSubmission } from "@/api/useSubmissionFlow.ts";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import { AgreementCheckbox } from "@/flows/send/steps/AgreementCheckbox.tsx";

/**
 * Port av CommonBolagsverketAgreement.vue — hämtar Bolagsverkets avtalstext och
 * kräver godkännande. Data-drivet så både skicka-in och färdigställ återanvänder.
 */
export function CommonBolagsverketAgreementStep({
  arsredovisning,
  stepLabel,
  onPrevious,
  onCancel,
  onNext,
}: {
  arsredovisning: Arsredovisning;
  stepLabel: string;
  onPrevious?: () => void;
  onCancel?: () => void;
  onNext: () => void;
}) {
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const prepare = usePrepareSubmission();
  const [userAgreed, setUserAgreed] = useState(false);

  useEffect(() => {
    prepare.mutate(arsredovisning, {
      onError: (e) =>
        showMessageModal(
          e instanceof Error ? `Teknisk information: ${e.message}` : String(e),
          "Fel vid kommunikation med Bolagsverket",
        ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avtalstext = prepare.data?.avtalstext;
  const lines = avtalstext
    ? avtalstext.split(/\r?\n/).filter((l) => l.trim().length > 0)
    : [];

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">{stepLabel}</p>

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
        onPrevious={onPrevious}
        onCancel={onCancel}
        onNext={onNext}
        nextDisabled={!userAgreed}
      />
    </div>
  );
}
