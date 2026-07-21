import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useFlowStore } from "@/stores/flowStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { useSubmitSubmission } from "@/api/useSubmissionFlow.ts";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Port av SendUploadReport.vue — laddar upp årsredovisningen till Bolagsverket
 * och visar signeringslänken. "Stäng" nollställer flödet och återgår.
 */
export function StepKlart({ stepNumber, numSteps }: SendStepProps) {
  const navigate = useNavigate();
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const ixbrl = useFlowStore((s) => s.ixbrl);
  const notificationEmail = useFlowStore((s) => s.notificationEmail);
  const reset = useFlowStore((s) => s.reset);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const submit = useSubmitSubmission();

  useEffect(() => {
    if (!arsredovisning || !ixbrl) return;
    submit.mutate(
      { arsredovisning, ixbrl, notificationEmail },
      {
        onError: (e) =>
          showMessageModal(
            e instanceof Error ? `Teknisk information: ${e.message}` : String(e),
            "Fel vid kommunikation med Bolagsverket",
          ),
      },
    );
    // Kör en gång vid montering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = submit.data;

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Ladda upp
      </p>

      {submit.isPending && (
        <div className="text-sm text-ink-medium">
          Laddar upp – det kan ta några sekunder…
        </div>
      )}

      {result != null && (
        <div className="space-y-3 text-sm text-ink-medium">
          <p>
            Årsredovisningen är nu uppladdad till ditt egna utrymme hos
            Bolagsverket.
          </p>
          <p>
            <a
              className="font-bold text-primary"
              href={result.url}
              target="_blank"
              rel="noreferrer"
              data-testid="send-wizard-sign-link"
            >
              Du kan nu klicka här för att signera den.
            </a>
          </p>
          <p>
            <strong className="text-ink">
              Observera att årsredovisningen inte är mottagen av Bolagsverket
              förrän du har signerat den i deras e-tjänst.
            </strong>
          </p>
        </div>
      )}

      <WizardFooter
        previousHidden
        onNext={() => {
          reset();
          void navigate({ to: "/redigera" });
        }}
        nextDisabled={result == null}
        nextLabel="Stäng"
      />
    </div>
  );
}
