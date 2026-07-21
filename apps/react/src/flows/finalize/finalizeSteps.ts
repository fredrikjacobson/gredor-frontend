export interface FinalizeStep {
  slug: string;
  label: string;
}

/** Alla färdigställ-steg i ordning; bankid/avtal/granska bara om callBolagsverket. */
export function getFinalizeSteps(callBolagsverket: boolean | null): FinalizeStep[] {
  const steps: FinalizeStep[] = [
    { slug: "paminnelse", label: "Glöm inte…" },
    { slug: "uppgifter", label: "Uppgifter" },
  ];
  if (callBolagsverket) {
    steps.push(
      { slug: "bankid", label: "BankID" },
      { slug: "bolagsverket-avtal", label: "Bolagsverkets villkor" },
      { slug: "granska", label: "Kontrollera" },
    );
  }
  steps.push(
    { slug: "ladda-ner-gredor", label: "Ladda ner fil" },
    { slug: "ladda-ner-pdf", label: "Skriv ut & signera" },
    { slug: "klar", label: "Klart" },
  );
  return steps;
}

export function getFinalizeStepIndex(
  steps: FinalizeStep[],
  slug: string,
): number {
  return steps.findIndex((s) => s.slug === slug);
}
