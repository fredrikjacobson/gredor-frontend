import { ArrowRight, BadgeCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { BolagsverketLogo } from "@/components/BolagsverketLogo.tsx";
import { PaperField } from "@/landing/backgrounds/PaperField.tsx";
import { LandingShell } from "@/landing/LandingShell.tsx";
import { LandingFooterNav } from "@/landing/LandingFooterNav.tsx";
import { ACTION_LABELS, LANDING_COPY } from "@/landing/landingCopy.ts";
import type { LandingVariantProps } from "@/landing/landingVariant.ts";

/**
 * Variant A "Papper" — redaktionell, asymmetrisk, helt utan rörelse.
 *
 * Rubriken sätts i EB Garamond, samma typsnitt som den färdiga årsredovisningen
 * renderas i. Ingångarna ligger som en enda knapprad i hjälten; de numrerade
 * raderna nedanför beskriver flödet i stället för att upprepa knapparna — varje
 * knapptext ur ACTION_LABELS får förekomma exakt en gång på sidan.
 */
export function LandingPapper(props: LandingVariantProps) {
  return (
    <LandingShell background={<PaperField />}>
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-medium">
              <BadgeCheck className="size-4 text-primary" />
              {LANDING_COPY.eyebrow}
              <BolagsverketLogo className="h-3.5 text-ink" />
            </span>

            <h1 className="text-balance font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
              {LANDING_COPY.titleLead}{" "}
              <em className="not-italic text-primary">
                {LANDING_COPY.titleAccent}
              </em>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-medium">
              {LANDING_COPY.lead}
            </p>

            {props.resumeAvailable && (
              <div className="mt-8 flex flex-wrap items-center gap-3 border-l-2 border-primary/40 py-1 pl-4">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {LANDING_COPY.resumeTitle}
                  </div>
                  <div className="text-sm text-ink-medium">
                    {props.resumeLabel}
                  </div>
                </div>
                <Button size="sm" onClick={props.onResume}>
                  {ACTION_LABELS.resume}
                </Button>
              </div>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={props.onNew}>
                {ACTION_LABELS.new} <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={props.onOpenFile}>
                {ACTION_LABELS.open}
              </Button>
              <Button size="lg" variant="ghost" onClick={props.onExample}>
                {ACTION_LABELS.example}
              </Button>
            </div>
          </div>

          <PaperSheet />
        </div>

        <ol className="mt-20 grid gap-px overflow-hidden rounded-2xl border bg-line/60 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-card/80 p-6">
              <div className="font-serif text-3xl text-primary/40">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-3 font-semibold text-ink">{step.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-medium">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-ink">
              {LANDING_COPY.omGredor.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-medium">
              {LANDING_COPY.omGredor.description}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/om-gredor">
              {LANDING_COPY.omGredor.action} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <LandingFooterNav className="mt-12" />
      </div>
    </LandingShell>
  );
}

const STEPS = [
  {
    title: "Importera eller börja tomt",
    description:
      "Läs in en SIE-fil från bokföringen så fylls resultat- och balansräkning i automatiskt.",
  },
  {
    title: "Fyll i och granska",
    description:
      "Noter, förvaltningsberättelse och underskrifter – med förhandsgranskning hela vägen.",
  },
  {
    title: "Skicka in digitalt",
    description:
      "Signera och lämna in den färdiga iXBRL-filen direkt till Bolagsverket.",
  },
];

/**
 * Dekorativ pappersark-attrapp: ett tonat utdrag ur en årsredovisning, byggt av
 * gradienter och tomma block. Ren dekor (aria-hidden) — den ska antyda
 * dokumentet utan att utge sig för att vara riktiga siffror.
 */
function PaperSheet() {
  return (
    <div aria-hidden className="relative hidden lg:block">
      <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_40%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_75%)]" />
      <div className="relative rotate-[1.5deg] rounded-sm border border-line bg-white p-8 shadow-raised">
        <div className="font-serif text-lg text-ink">Årsredovisning</div>
        <div className="mt-1 text-[0.7rem] uppercase tracking-widest text-ink-light">
          Räkenskapsåret 2025
        </div>

        <div className="mt-6 space-y-2.5">
          {[100, 82, 92, 68].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-line"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>

        <div className="mt-7 border-t pt-4">
          <div className="mb-2 text-[0.7rem] uppercase tracking-widest text-ink-light">
            Resultaträkning
          </div>
          {[
            ["Nettoomsättning", 62],
            ["Rörelsens kostnader", 54],
            ["Årets resultat", 44],
          ].map(([label, w]) => (
            <div
              key={label as string}
              className="flex items-center justify-between gap-6 border-b border-line/70 py-2 text-xs text-ink-medium last:border-b-0"
            >
              <span>{label}</span>
              <span
                className="h-1.5 rounded-full bg-primary/25"
                style={{ width: `${w as number}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
