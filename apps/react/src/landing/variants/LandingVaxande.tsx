import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { BolagsverketLogo } from "@/components/BolagsverketLogo.tsx";
import { SeedCanvas } from "@/landing/backgrounds/SeedCanvas.tsx";
import { Grain } from "@/landing/backgrounds/Grain.tsx";
import { LandingShell } from "@/landing/LandingShell.tsx";
import { LandingFooterNav } from "@/landing/LandingFooterNav.tsx";
import { ACTION_LABELS, LANDING_COPY } from "@/landing/landingCopy.ts";
import type { LandingVariantProps } from "@/landing/landingVariant.ts";

/**
 * Variant C "Växande" — fältet är huvudnumret. Hjälten tar nästan hela
 * viewporten och innehållet ligger i en enda kolumn ovanpå; ingångarna och Om
 * Gredor kommer först när man scrollar.
 */
export function LandingVaxande(props: LandingVariantProps) {
  return (
    <LandingShell background={<GrowthField />}>
      <section className="mx-auto flex min-h-[82vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/70 px-4 py-1.5 text-sm font-medium text-primary-dark">
          <BadgeCheck className="size-4" /> {LANDING_COPY.eyebrow}
          <BolagsverketLogo className="h-4 text-ink" />
        </span>

        <h1 className="text-balance text-6xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-7xl">
          {LANDING_COPY.titleLead}{" "}
          <span className="text-primary">{LANDING_COPY.titleAccent}</span>
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-medium">
          {LANDING_COPY.lead}
        </p>

        {props.resumeAvailable && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-full border border-primary/25 bg-surface/80 py-2 pl-5 pr-2 text-sm">
            <span className="text-ink-medium">
              {LANDING_COPY.resumeTitle} – {props.resumeLabel}
            </span>
            <Button size="sm" onClick={props.onResume}>
              {ACTION_LABELS.resume}
            </Button>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={props.onNew}>
            {ACTION_LABELS.new} <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={props.onOpenFile}>
            {ACTION_LABELS.open}
          </Button>
          <Button size="lg" variant="ghost" onClick={props.onExample}>
            {ACTION_LABELS.example}
          </Button>
        </div>

        <div className="mt-16 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ink-light">
          <ArrowDown className="size-3.5" /> Så funkar det
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-20">
        <div className="grid gap-8 rounded-3xl border bg-surface/80 p-8 sm:grid-cols-3">
          {(
            [
              LANDING_COPY.entries.new,
              LANDING_COPY.entries.open,
              LANDING_COPY.entries.example,
            ] as const
          ).map((entry) => (
            <div key={entry.title}>
              <div className="font-semibold text-ink">{entry.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-medium">
                {entry.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <h2 className="font-semibold text-ink">
              {LANDING_COPY.omGredor.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-medium">
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
      </section>
    </LandingShell>
  );
}

/**
 * Canvasen plus två stillastående lager: ett ljus i mitten så texten alltid har
 * kontrast mot fältet, och papperskorn överst. Inget av dem animeras — hade de
 * legat i samma kompositlager som något rörligt skulle turbulensen rastreras om
 * varje bildruta.
 */
function GrowthField() {
  return (
    <>
      <SeedCanvas />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(52%_44%_at_50%_38%,var(--color-surface)_0%,color-mix(in_srgb,var(--color-surface)_80%,transparent)_55%,transparent_80%)]"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <Grain className="opacity-[0.05] mix-blend-multiply" />
      </div>
    </>
  );
}
