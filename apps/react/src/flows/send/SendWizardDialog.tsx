import { type ReactNode, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { SEND_STEPS, getSendStepIndex } from "@/flows/send/sendSteps.ts";
import { cn } from "@/lib/utils.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { StepFiler } from "@/flows/send/steps/StepFiler.tsx";
import { StepInformation } from "@/flows/send/steps/StepInformation.tsx";
import { StepBankId } from "@/flows/send/steps/StepBankId.tsx";
import { StepBolagsverketAgreement } from "@/flows/send/steps/StepBolagsverketAgreement.tsx";
import { StepGredorAgreement } from "@/flows/send/steps/StepGredorAgreement.tsx";
import { StepBekrafta } from "@/flows/send/steps/StepBekrafta.tsx";
import { StepFaststallelseintyg } from "@/flows/send/steps/StepFaststallelseintyg.tsx";
import { StepGenerera } from "@/flows/send/steps/StepGenerera.tsx";
import { StepGranska } from "@/flows/send/steps/StepGranska.tsx";
import { StepKlart } from "@/flows/send/steps/StepKlart.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

/**
 * Skicka-in-guiden som dialog (tidigare den routade sidan `/skicka-in`).
 * Stegen hålls i lokalt läge; steget gatar självt "Nästa" så det linjära
 * flödet räcker (ingen URL-hoppning som behöver canEnter-vakten).
 */
export function SendWizardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [stepSlug, setStepSlug] = useState(SEND_STEPS[0].slug);

  useEffect(() => {
    if (open) setStepSlug(SEND_STEPS[0].slug);
  }, [open]);

  const index = Math.max(0, getSendStepIndex(stepSlug));
  const numSteps = SEND_STEPS.length;

  const stepProps: SendStepProps = {
    goNext: () => {
      const next = SEND_STEPS[index + 1];
      if (next) setStepSlug(next.slug);
    },
    goPrevious: () => {
      const prev = SEND_STEPS[index - 1];
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
          <DialogTitle>Skicka in till Bolagsverket</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 md:flex-row">
          <StepRail currentIndex={index} />
          <div className="min-w-0 flex-1">{renderStep(stepSlug, stepProps)}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepRail({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className="shrink-0 space-y-1.5 md:w-52">
      {SEND_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li
            key={step.slug}
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
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

function renderStep(step: string, props: SendStepProps): ReactNode {
  switch (step) {
    case "filer":
      return <StepFiler {...props} />;
    case "information":
      return <StepInformation {...props} />;
    case "bankid":
      return <StepBankId {...props} />;
    case "bolagsverket-avtal":
      return <StepBolagsverketAgreement {...props} />;
    case "faststallelseintyg":
      return <StepFaststallelseintyg {...props} />;
    case "generera":
      return <StepGenerera {...props} />;
    case "granska":
      return <StepGranska {...props} />;
    case "gredor-avtal":
      return <StepGredorAgreement {...props} />;
    case "bekrafta":
      return <StepBekrafta {...props} />;
    case "klart":
      return <StepKlart {...props} />;
    default:
      return null;
  }
}
