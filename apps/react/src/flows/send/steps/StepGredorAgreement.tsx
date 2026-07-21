import { useState } from "react";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import { AgreementCheckbox } from "@/flows/send/steps/AgreementCheckbox.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/** Port av SendGredorAgreement.vue — Gredors ansvarsfriskrivning + godkännande. */
export function StepGredorAgreement({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const [userAgreed, setUserAgreed] = useState(false);

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Information från Gredor
      </p>

      <div className="space-y-3 text-sm text-ink-medium">
        <p>
          Gredor är ett gratisverktyg. I slutet av flödet kommer din
          årsredovisning att laddas upp till Bolagsverket i iXBRL-format, ett
          speciellt format som används för bland annat årsredovisningar och ska
          motsvara det som har visats i förhandsgranskningen tidigare i flödet.
          Vi som utvecklar Gredor har testat verktyget noggrant för att minimera
          risken för att något ska bli fel då, men tänk på att vi inte lämnar
          några garantier.
        </p>
        <p>Genom att kryssa i rutan nedan godtar du detta.</p>
        <div className="flex justify-center pt-2">
          <AgreementCheckbox
            id="gredorAgreementCheck"
            checked={userAgreed}
            onChange={setUserAgreed}
            label="Jag godkänner Gredors villkor"
          />
        </div>
      </div>

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={!userAgreed}
      />
    </div>
  );
}
