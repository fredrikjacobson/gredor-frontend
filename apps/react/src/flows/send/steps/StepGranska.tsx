import { useEffect } from "react";
import { useFlowStore } from "@/stores/flowStore.ts";
import { useUiStore } from "@/stores/uiStore.ts";
import { useValidateSubmission } from "@/api/useSubmissionFlow.ts";
import { cn } from "@/lib/utils.ts";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Port av CommonValidateReport.vue — kör Bolagsverkets kontroller på den
 * genererade iXBRL:en och visar utfallet. Nästa spärras vid tekniska fel.
 */
export function StepGranska({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const ixbrl = useFlowStore((s) => s.ixbrl);
  const showMessageModal = useUiStore((s) => s.showMessageModal);
  const validate = useValidateSubmission();

  useEffect(() => {
    if (!arsredovisning || !ixbrl) return;
    validate.mutate(
      {
        arsredovisning,
        ixbrl,
        discardFaststallelseintygValidations: false,
      },
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

  const result = validate.data;
  const utfall = result?.utfall ?? [];
  const hasError = utfall.some((u) => u.typ === "error");

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Bolagsverkets kontroller
      </p>

      {validate.isPending && (
        <div className="text-sm text-ink-medium">
          Kontrollerar – det kan ta några sekunder…
        </div>
      )}

      {result != null && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-ink">Kontrollresultat</h3>

          {utfall.map((u, index) => (
            <div
              key={index}
              role="alert"
              className={cn(
                "rounded-md border p-3 text-sm",
                u.typ === "error" && "border-danger/40 bg-danger/10 text-danger",
                u.typ === "warn" &&
                  "border-warning/40 bg-warning/10 text-ink",
                u.typ === "info" && "border-line bg-surface-medium text-ink",
              )}
            >
              {u.typ === "error" && <strong>Fel: </strong>}
              {u.typ === "warn" && <strong>Varning: </strong>}
              {u.typ === "info" && <strong>Information: </strong>}
              {u.text}
            </div>
          ))}

          {utfall.length > 0 ? (
            <div className="text-sm text-ink-medium">
              <h4 className="font-semibold text-ink">
                Hur man tolkar kontrollresultatet
              </h4>
              <ul className="ml-5 list-disc space-y-1">
                {hasError && (
                  <li>
                    <strong>Fel</strong> <span className="underline">måste</span>{" "}
                    åtgärdas innan du fortsätter; vid tekniska fel, mejla{" "}
                    <a
                      className="text-primary"
                      href="mailto:gredor@potatiz.com"
                    >
                      gredor@potatiz.com
                    </a>{" "}
                    för hjälp
                  </li>
                )}
                <li>
                  <strong>Varningar</strong> bör om möjligt åtgärdas innan du
                  fortsätter, för att minimera risken för att du får ett
                  föreläggande från Bolagsverket
                </li>
                <li>
                  <strong>Informationsmeddelanden</strong> är endast för
                  upplysning
                </li>
              </ul>
            </div>
          ) : (
            <p className="text-sm text-success">
              Bolagsverkets automatiska kontroller hittade inga anmärkningar.
            </p>
          )}
        </div>
      )}

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={result == null || hasError}
      />
    </div>
  );
}
