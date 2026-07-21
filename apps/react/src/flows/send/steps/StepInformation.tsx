import isEmail from "validator/es/lib/isEmail";
import { useFlowStore } from "@/stores/flowStore.ts";
import { Input } from "@/components/ui/input.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import { isValidPersonalNumber } from "@/flows/send/sendSteps.ts";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Port av SendRequestInformation.vue — personnummer + aviserings-e-post. */
export function StepInformation({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const personalNumber = useFlowStore((s) => s.personalNumber);
  const notificationEmail = useFlowStore((s) => s.notificationEmail);
  const setPersonalNumber = useFlowStore((s) => s.setPersonalNumber);
  const setNotificationEmail = useFlowStore((s) => s.setNotificationEmail);

  const luhnInvalid =
    /^\d{12}$/.test(personalNumber) && !isValidPersonalNumber(personalNumber);
  const nextDisabled =
    !isValidPersonalNumber(personalNumber) || !isEmail(notificationEmail);

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Fyll i uppgifter
      </p>

      <h3 className="mb-1 text-base font-semibold text-ink">Personnummer</h3>
      <p className="mb-2 text-sm text-ink-medium">
        Du som initierar inskickningen måste vara behörig att företräda företaget
        och kunna identifiera dig med BankID. Det måste även vara ditt namn på
        fastställelseintyget. Format: ÅÅÅÅMMDDXXXX (12 siffror utan bindestreck).
      </p>
      <Input
        className="max-w-xs"
        maxLength={12}
        inputMode="numeric"
        data-testid="send-wizard-personalnumber-input"
        placeholder="Skriv personnummer här…"
        value={personalNumber}
        onChange={(e) => setPersonalNumber(e.target.value.trim())}
      />
      {luhnInvalid && (
        <p className="mt-1 text-sm font-semibold text-danger">
          Ogiltigt personnummer.
        </p>
      )}

      <h3 className="mb-1 mt-6 text-base font-semibold text-ink">
        E-post för aviseringar
      </h3>
      <p className="mb-2 text-sm text-ink-medium">
        Aviseringar från Bolagsverket gällande årsredovisningen skickas hit.
      </p>
      <Input
        className="max-w-xs"
        type="email"
        data-testid="send-wizard-email-input"
        placeholder="Skriv e-postadress här…"
        value={notificationEmail}
        onChange={(e) => setNotificationEmail(e.target.value.trim())}
      />

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={nextDisabled}
      />
    </div>
  );
}
