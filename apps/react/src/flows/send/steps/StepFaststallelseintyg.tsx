import "@/render/render.scss";
import "@/render/renderComponents.scss";
import type { Arsredovisning } from "@/model/arsredovisning/Arsredovisning.ts";
import { useFlowStore } from "@/stores/flowStore.ts";
import { isFaststallseintygRequiresStammansResultatdisposition } from "@/data/faststallelseintyg.ts";
import { EditFaststallelseintyg } from "@/edit/EditFaststallelseintyg.tsx";
import { RenderFaststallelseintyg } from "@/render/blocks/RenderFaststallelseintyg.tsx";
import { WizardFooter } from "@/flows/WizardFooter.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Port av SendAddFaststallelseintyg.vue — redigera fastställelseintyget och
 * förhandsgranska det. Nästa spärras tills intyget är komplett.
 */
export function StepFaststallelseintyg({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: SendStepProps) {
  const arsredovisning = useFlowStore((s) => s.arsredovisning);
  const editArsredovisning = useFlowStore((s) => s.editArsredovisning);
  // Rendera om redigerare + förhandsgranskning vid in-place-redigering.
  useFlowStore((s) => s.revision);

  if (!arsredovisning) return null;

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-ink-medium">
        Steg {stepNumber}/{numSteps}: Lägg till fastställelseintyg
      </p>

      <EditFaststallelseintyg
        arsredovisning={arsredovisning}
        edit={editArsredovisning}
      />

      <h3 className="mb-2 mt-6 text-base font-semibold text-ink">
        Förhandsgranskning
      </h3>
      <div className="overflow-auto rounded-lg border border-line bg-surface p-2">
        <div className="arsredovisning-root">
          <div className="arsredovisning-content">
            <RenderFaststallelseintyg arsredovisning={arsredovisning} />
          </div>
        </div>
      </div>

      <WizardFooter
        onPrevious={goPrevious}
        onCancel={cancel}
        onNext={goNext}
        nextDisabled={!isValidFaststallelseintyg(arsredovisning)}
      />
    </div>
  );
}

/** Speglar SendAddFaststallelseintyg.vue:s isValidFaststallelseintyg. */
function isValidFaststallelseintyg(arsredovisning: Arsredovisning): boolean {
  const faststallelseintyg = arsredovisning.faststallelseintyg;
  return Boolean(
    faststallelseintyg &&
      faststallelseintyg.datumArsstamma &&
      faststallelseintyg.resultatdispositionBeslut.text &&
      faststallelseintyg.resultatdispositionBeslut.xbrlId &&
      faststallelseintyg.underskrift.tilltalsnamn &&
      faststallelseintyg.underskrift.efternamn &&
      faststallelseintyg.underskrift.roll &&
      (!isFaststallseintygRequiresStammansResultatdisposition(
        faststallelseintyg,
      ) ||
        Object.values(faststallelseintyg.resultatdispositionStammans).some(
          (value) => value,
        )),
  );
}
