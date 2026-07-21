import { useFinalizeStore } from "@/stores/finalizeStore.ts";
import { Input } from "@/components/ui/input.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import { isValidPersonalNumber } from "@/flows/send/sendSteps.ts";
import type { FinalizeStepProps } from "@/flows/finalize/steps/FinalizeStepProps.ts";

/**
 * Port av FinalizeRequestInformation.vue — vill användaren köra Bolagsverkets
 * kontroller? I så fall krävs personnummer för BankID.
 */
export function StepFinalizeInformation({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const callBolagsverket = useFinalizeStore((s) => s.callBolagsverket);
  const setCallBolagsverket = useFinalizeStore((s) => s.setCallBolagsverket);
  const personalNumber = useFinalizeStore((s) => s.personalNumber);
  const setPersonalNumber = useFinalizeStore((s) => s.setPersonalNumber);

  const luhnInvalid =
    /^\d{12}$/.test(personalNumber) && !isValidPersonalNumber(personalNumber);
  const nextDisabled =
    callBolagsverket === null ||
    (callBolagsverket && !isValidPersonalNumber(personalNumber));

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Fyll i uppgifter
      </p>

      <h3 className="mb-1 text-base font-semibold text-ink">
        Bolagsverkets kontroller
      </h3>
      <p className="mb-2 text-sm text-ink-medium">
        Gredor har möjlighet att redan nu köra Bolagsverkets automatiska
        kontroller på din årsredovisning. Kontrollerna är av begränsad omfattning,
        men de kan vara till hjälp för att upptäcka såväl vanliga som ovanliga
        fel. För att använda funktionen behöver du kunna identifiera dig med
        BankID.
      </p>
      <p className="mb-2 text-sm text-ink-medium">
        Vill du kontrollera din årsredovisning genom Bolagsverket?
      </p>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="radio"
            name="callBolagsverket"
            data-testid="finalize-call-bolagsverket-yes"
            checked={callBolagsverket === true}
            onChange={() => setCallBolagsverket(true)}
          />
          Ja, kör Bolagsverkets kontroller <strong>(rekommenderas)</strong>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="radio"
            name="callBolagsverket"
            data-testid="finalize-call-bolagsverket-no"
            checked={callBolagsverket === false}
            onChange={() => setCallBolagsverket(false)}
          />
          Nej, kör inte Bolagsverkets kontroller
        </label>
      </div>

      {callBolagsverket && (
        <div className="mt-4">
          <h3 className="mb-1 text-base font-semibold text-ink">Personnummer</h3>
          <p className="mb-2 text-sm text-ink-medium">
            Fyll i ditt personnummer nedan för att legitimera dig med BankID.
            Format: ÅÅÅÅMMDDXXXX (12 siffror utan bindestreck)
          </p>
          <Input
            className="max-w-xs"
            maxLength={12}
            inputMode="numeric"
            data-testid="finalize-personalnumber-input"
            placeholder="Skriv personnummer här…"
            value={personalNumber}
            onChange={(e) => setPersonalNumber(e.target.value.trim())}
          />
          {luhnInvalid && (
            <p className="mt-1 text-sm font-semibold text-danger">
              Ogiltigt personnummer.
            </p>
          )}
        </div>
      )}

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={nextDisabled}
      />
    </div>
  );
}
