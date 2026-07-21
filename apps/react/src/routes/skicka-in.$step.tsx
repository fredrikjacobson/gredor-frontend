import { type ReactNode } from "react";
import {
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useFlowStore } from "@/stores/flowStore.ts";
import {
  SEND_STEPS,
  furthestAllowedSendStep,
  getSendStepIndex,
} from "@/flows/send/sendSteps.ts";
import { cn } from "@/lib/utils.ts";
import { StepFiler } from "@/flows/send/steps/StepFiler.tsx";
import { StepInformation } from "@/flows/send/steps/StepInformation.tsx";
import type { SendStepProps } from "@/flows/send/steps/StepProps.ts";

export const Route = createFileRoute("/skicka-in/$step")({
  beforeLoad: ({ params }) => {
    const state = useFlowStore.getState();
    const step = SEND_STEPS.find((s) => s.slug === params.step);
    // Okänt steg eller förbi ett ofullständigt steg → hoppa till längst tillåtna.
    if (!step || !step.canEnter(state)) {
      const target = furthestAllowedSendStep(state);
      if (target !== params.step) {
        throw redirect({
          to: "/skicka-in/$step",
          params: { step: target },
        });
      }
    }
  },
  component: SendWizard,
});

function SendWizard() {
  const { step } = Route.useParams();
  const navigate = useNavigate();
  const index = getSendStepIndex(step);
  const numSteps = SEND_STEPS.length;

  const stepProps: SendStepProps = {
    goNext: () => {
      const next = SEND_STEPS[index + 1];
      if (next) {
        void navigate({ to: "/skicka-in/$step", params: { step: next.slug } });
      }
    },
    goPrevious: () => {
      const prev = SEND_STEPS[index - 1];
      if (prev) {
        void navigate({ to: "/skicka-in/$step", params: { step: prev.slug } });
      }
    },
    cancel: () => void navigate({ to: "/redigera" }),
    stepNumber: index + 1,
    numSteps,
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 md:flex-row">
      <StepRail currentIndex={index} />
      <div className="flex-1 rounded-lg border border-line bg-surface p-6 shadow-card">
        {renderStep(step, stepProps)}
      </div>
    </div>
  );
}

function StepRail({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className="shrink-0 space-y-2 md:w-56">
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
    default:
      return (
        <div>
          <p className="mb-4 text-sm font-medium text-ink-medium">
            Steg {props.stepNumber}/{props.numSteps}
          </p>
          <p className="text-sm text-ink-light">
            Det här steget porteras härnäst i fas 5.
          </p>
        </div>
      );
  }
}
