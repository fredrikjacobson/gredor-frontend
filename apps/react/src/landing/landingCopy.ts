/**
 * Startsidans knapptexter på ETT ställe. Playwright matchar tillgängliga namn
 * som skiftlägesokänslig delsträng (`getByRole("button", { name: "Börja" })`),
 * så varje variant måste använda exakt de här strängarna — och inget annat
 * klickbart på sidan får innehålla dem. Se e2e/startpage.spec.ts.
 */
export const ACTION_LABELS = {
  new: "Börja",
  open: "Öppna",
  example: "Visa exempel",
  resume: "Fortsätt",
} as const;

/** Delad brödtext så varianterna inte driver isär budskapet. */
export const LANDING_COPY = {
  eyebrow: "Helt gratis · godkänd av",
  titleLead: "Din årsredovisning,",
  titleAccent: "utan krångel",
  lead: "Gredor hjälper dig att ta fram en K2-årsredovisning för aktiebolag och skicka in den digitalt till Bolagsverket. Importera en SIE-fil eller börja från början.",
  entries: {
    new: {
      title: "Ny årsredovisning",
      description: "Börja från början eller importera en SIE-fil.",
    },
    open: {
      title: "Öppna fil",
      description: "Fortsätt på en sparad .gredorutkast-fil.",
    },
    example: {
      title: "Utforska exempel",
      description: "Se en ifylld exempel-årsredovisning.",
    },
  },
  omGredor: {
    title: "Om Gredor",
    description:
      "Gredor är ett kostnadsfritt, öppet verktyg – byggt av småföretagare för småföretagare. Läs mer om vad Gredor är, vad du bör tänka på och hur du kommer i kontakt med oss.",
    action: "Mer om Gredor",
  },
  resumeTitle: "Fortsätt där du slutade",
} as const;
