import { type ReactNode, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { useFinalizeStore } from "@/stores/finalizeStore.ts";
import { addTodoListItem } from "@/model/todolist/TodoList.ts";
import {
  getFinalizeStepIndex,
  getFinalizeSteps,
  type FinalizeStep,
} from "@/flows/finalize/finalizeSteps.ts";
import { cn } from "@/lib/utils.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { CommonBankIdStep } from "@/flows/common/CommonBankIdStep.tsx";
import { CommonBolagsverketAgreementStep } from "@/flows/common/CommonBolagsverketAgreementStep.tsx";
import { CommonValidateStep } from "@/flows/common/CommonValidateStep.tsx";
import { StepReminder } from "@/flows/finalize/steps/StepReminder.tsx";
import { StepFinalizeInformation } from "@/flows/finalize/steps/StepFinalizeInformation.tsx";
import { StepDownloadGredor } from "@/flows/finalize/steps/StepDownloadGredor.tsx";
import { StepDownloadReport } from "@/flows/finalize/steps/StepDownloadReport.tsx";
import { StepFinish } from "@/flows/finalize/steps/StepFinish.tsx";
import type { FinalizeStepProps } from "@/flows/finalize/steps/FinalizeStepProps.ts";

/**
 * Färdigställ-guiden som dialog (tidigare den routade sidan `/fardigstall`).
 * Stegen hålls i lokalt läge i stället för i URL:en, så användaren stannar kvar
 * i editorn.
 */
export function FinalizeWizardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const callBolagsverket = useFinalizeStore((s) => s.callBolagsverket);
  const steps = getFinalizeSteps(callBolagsverket);
  const [stepSlug, setStepSlug] = useState(steps[0].slug);

  // Börja alltid om från första steget när dialogen öppnas.
  useEffect(() => {
    if (open) setStepSlug("paminnelse");
  }, [open]);

  const index = Math.max(0, getFinalizeStepIndex(steps, stepSlug));
  const numSteps = steps.length;

  const stepProps: FinalizeStepProps = {
    goNext: () => {
      const next = steps[index + 1];
      if (next) setStepSlug(next.slug);
    },
    goPrevious: () => {
      const prev = steps[index - 1];
      if (prev) setStepSlug(prev.slug);
    },
    cancel: () => onOpenChange(false),
    stepNumber: index + 1,
    numSteps,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Färdigställ inför årsstämma</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 md:flex-row">
          <StepRail steps={steps} currentIndex={index} />
          <div className="min-w-0 flex-1">{renderStep(steps[index]?.slug ?? stepSlug, stepProps)}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepRail({
  steps,
  currentIndex,
}: {
  steps: FinalizeStep[];
  currentIndex: number;
}) {
  return (
    <ol className="shrink-0 space-y-1.5 md:w-52">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li
            key={s.slug}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
              active && "bg-primary/10 font-medium text-ink",
              !active && "text-ink-medium",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                done && "border-primary bg-primary text-white",
                active && "border-primary text-primary",
                !done && !active && "border-line text-ink-light",
              )}
            >
              {done ? <Check className="size-3" /> : i + 1}
            </span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

function renderStep(step: string, props: FinalizeStepProps): ReactNode {
  switch (step) {
    case "paminnelse":
      return <StepReminder {...props} />;
    case "uppgifter":
      return <StepFinalizeInformation {...props} />;
    case "bankid":
      return <FinalizeBankId {...props} />;
    case "bolagsverket-avtal":
      return <FinalizeAgreement {...props} />;
    case "granska":
      return <FinalizeValidate {...props} />;
    case "ladda-ner-gredor":
      return <StepDownloadGredor {...props} />;
    case "ladda-ner-pdf":
      return <StepDownloadReport {...props} />;
    case "klar":
      return <StepFinish {...props} />;
    default:
      return null;
  }
}

/** Färdigställ-wrappers över de delade Common-stegen. */
function FinalizeBankId({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const personalNumber = useFinalizeStore((s) => s.personalNumber);
  return (
    <CommonBankIdStep
      personalNumber={personalNumber}
      stepLabel={`Steg ${stepNumber}/${numSteps}: Legitimera med BankID`}
      allowSkip
      onVerified={() => {}}
      onPrevious={goPrevious}
      onCancel={cancel}
      onNext={goNext}
    />
  );
}

function FinalizeAgreement({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  if (!arsredovisning) return null;
  return (
    <CommonBolagsverketAgreementStep
      arsredovisning={arsredovisning}
      stepLabel={`Steg ${stepNumber}/${numSteps}: Information från Bolagsverket`}
      onPrevious={goPrevious}
      onCancel={cancel}
      onNext={goNext}
    />
  );
}

function FinalizeValidate({
  goNext,
  goPrevious,
  cancel,
  stepNumber,
  numSteps,
}: FinalizeStepProps) {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const edit = useArsredovisningStore((s) => s.edit);
  const ixbrl = useFinalizeStore((s) => s.ixbrl);
  if (!arsredovisning || !ixbrl) return null;
  return (
    <CommonValidateStep
      arsredovisning={arsredovisning}
      ixbrl={ixbrl}
      discardFaststallelseintygValidations
      stepLabel={`Steg ${stepNumber}/${numSteps}: Bolagsverkets kontroller`}
      onWarnings={(texts) =>
        edit((ar) =>
          addTodoListItem(ar.gredorState.todoList, {
            id: "bolagsverkets-kontroller",
            type: "validation",
            title: "Bolagsverkets kontroller",
            description: "Följande fel/varningar upptäcktes av Bolagsverket.",
            timestamp: Date.now(),
            tasks: texts.map((text) => ({ text, complete: false })),
          }),
        )
      }
      onPrevious={goPrevious}
      onCancel={cancel}
      onNext={goNext}
    />
  );
}
