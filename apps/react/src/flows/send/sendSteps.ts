import validator from "validator";

const { isEmail } = validator;
import LuhnAlgorithm from "@designbycode/luhn-algorithm";
import type { useFlowStore } from "@/stores/flowStore.ts";

type FlowState = ReturnType<typeof useFlowStore.getState>;

export interface SendStep {
  /** URL-slug (`/skicka-in/<slug>`). */
  slug: string;
  /** Etikett i steg-listan. */
  label: string;
  /**
   * Får steget besökas givet nuvarande flödestillstånd? Används av route-
   * beforeLoad för att förhindra att man hoppar förbi ofullständiga steg.
   */
  canEnter: (state: FlowState) => boolean;
}

const personnummerRegex = /^\d{12}$/;

export function isValidPersonalNumber(value: string): boolean {
  return (
    personnummerRegex.test(value) && LuhnAlgorithm.isValid(value.substring(2))
  );
}

const hasFile = (s: FlowState) => s.arsredovisning != null;
const hasInfo = (s: FlowState) =>
  hasFile(s) &&
  isValidPersonalNumber(s.personalNumber) &&
  isEmail(s.notificationEmail);
const hasBankId = (s: FlowState) => hasInfo(s) && s.bankIdVerified;
const hasIxbrl = (s: FlowState) => hasBankId(s) && s.ixbrl != null;

/** Skicka-in-flödets steg i ordning (matchar Vue SendWizardSteps 1:1). */
export const SEND_STEPS: SendStep[] = [
  { slug: "filer", label: "Ladda upp fil", canEnter: () => true },
  { slug: "information", label: "Uppgifter", canEnter: hasFile },
  { slug: "bankid", label: "BankID", canEnter: hasInfo },
  { slug: "bolagsverket-avtal", label: "Bolagsverkets villkor", canEnter: hasBankId },
  { slug: "faststallelseintyg", label: "Fastställelseintyg", canEnter: hasBankId },
  { slug: "generera", label: "Generera", canEnter: hasBankId },
  { slug: "granska", label: "Kontrollera", canEnter: hasIxbrl },
  { slug: "gredor-avtal", label: "Gredors villkor", canEnter: hasIxbrl },
  { slug: "bekrafta", label: "Bekräfta", canEnter: hasIxbrl },
  { slug: "klart", label: "Skicka in", canEnter: hasIxbrl },
];

export function getSendStepIndex(slug: string): number {
  return SEND_STEPS.findIndex((step) => step.slug === slug);
}

/**
 * Det längst framskridna steget som får besökas nu. Route-beforeLoad omdirigerar
 * hit om användaren försöker hoppa förbi.
 */
export function furthestAllowedSendStep(state: FlowState): string {
  let allowed = SEND_STEPS[0];
  for (const step of SEND_STEPS) {
    if (step.canEnter(state)) allowed = step;
    else break;
  }
  return allowed.slug;
}
