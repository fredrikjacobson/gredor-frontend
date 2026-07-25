import { type PointerEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  FilePlus2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { BolagsverketLogo } from "@/components/BolagsverketLogo.tsx";
import { MeadowField } from "@/landing/backgrounds/MeadowField.tsx";
import { LandingShell } from "@/landing/LandingShell.tsx";
import { LandingFooterNav } from "@/landing/LandingFooterNav.tsx";
import { ACTION_LABELS, LANDING_COPY } from "@/landing/landingCopy.ts";
import type { LandingVariantProps } from "@/landing/landingVariant.ts";
import { cn } from "@/lib/utils.ts";

/**
 * Variant B "Levande äng" — centrerad och luftig ovanpå de drivande färgfälten.
 * Korten är glas (backdrop-blur) med en ljuskägla som följer pekaren.
 *
 * Entrén är en avslutande animation (ingen `infinite`, ingen `alternate`):
 * Playwright kräver att en knapps bounding box står stilla två bildrutor i rad
 * innan click(), så inget som ligger på eller ovanför en knapp får röra sig för
 * evigt.
 */
export function LandingAng(props: LandingVariantProps) {
  return (
    <LandingShell background={<MeadowField />}>
      <div className="mx-auto flex w-full max-w-4xl flex-col px-6 py-20">
        <div className="text-center">
          <Reveal delay={0}>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/70 px-4 py-1.5 text-sm font-medium text-primary-dark backdrop-blur">
              <BadgeCheck className="size-4" /> {LANDING_COPY.eyebrow}
              <BolagsverketLogo className="h-4 text-ink" />
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-balance text-6xl font-semibold leading-[1.03] tracking-tight text-ink sm:text-7xl">
              {LANDING_COPY.titleLead}{" "}
              <span className="bg-[linear-gradient(100deg,var(--color-primary),var(--color-primary-light)_55%,var(--color-secondary))] bg-clip-text text-transparent">
                {LANDING_COPY.titleAccent}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-medium">
              {LANDING_COPY.lead}
            </p>
          </Reveal>
        </div>

        {props.resumeAvailable && (
          <Reveal delay={220}>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-card/70 p-5 shadow-card backdrop-blur">
              <div>
                <div className="font-semibold text-ink">
                  {LANDING_COPY.resumeTitle}
                </div>
                <div className="text-sm text-ink-medium">
                  {props.resumeLabel}
                </div>
              </div>
              <Button onClick={props.onResume}>{ACTION_LABELS.resume}</Button>
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <GlassCard
            delay={280}
            icon={<FilePlus2 className="size-6" />}
            tint="primary"
            title={LANDING_COPY.entries.new.title}
            description={LANDING_COPY.entries.new.description}
            actionLabel={ACTION_LABELS.new}
            onClick={props.onNew}
          />
          <GlassCard
            delay={360}
            icon={<FolderOpen className="size-6" />}
            tint="info"
            title={LANDING_COPY.entries.open.title}
            description={LANDING_COPY.entries.open.description}
            actionLabel={ACTION_LABELS.open}
            onClick={props.onOpenFile}
          />
          <GlassCard
            delay={440}
            icon={<Sparkles className="size-6" />}
            tint="warning"
            title={LANDING_COPY.entries.example.title}
            description={LANDING_COPY.entries.example.description}
            actionLabel={ACTION_LABELS.example}
            onClick={props.onExample}
          />
        </div>

        <Reveal delay={520}>
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border bg-card/60 p-6 text-center shadow-card backdrop-blur sm:flex-row sm:text-left">
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
        </Reveal>

        <LandingFooterNav className="mt-12" />
      </div>
    </LandingShell>
  );
}

/**
 * Insläppsanimation via tw-animate-css. `backwards` fyllnadsläge gör att
 * elementet är osynligt under fördröjningen i stället för att blinka fram och
 * sedan tona in igen.
 */
function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-fill-mode:backwards] motion-reduce:animate-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const TINT: Record<string, string> = {
  primary: "bg-primary/12 text-primary",
  info: "bg-info/12 text-info",
  warning: "bg-warning/15 text-[#b57f19]",
};

function GlassCard(props: {
  delay: number;
  icon: ReactNode;
  tint: keyof typeof TINT;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  /*
   * Pekarens position skrivs direkt som CSS-variabler på elementet. Att lägga
   * den i state hade renderat om kortet vid varje musrörelse.
   */
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <Reveal delay={props.delay}>
      <div
        onPointerMove={onPointerMove}
        className="gredor-landing-spotlight relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-card/70 p-6 shadow-card backdrop-blur-md transition-shadow hover:shadow-raised"
      >
        <div
          className={cn(
            "mb-3 grid size-12 place-items-center rounded-xl",
            TINT[props.tint],
          )}
        >
          {props.icon}
        </div>
        <div className="font-semibold text-ink">{props.title}</div>
        <p className="mb-4 mt-1 flex-1 text-sm leading-relaxed text-ink-medium">
          {props.description}
        </p>
        <Button variant="outline" onClick={props.onClick} className="relative">
          {props.actionLabel}
        </Button>
      </div>
    </Reveal>
  );
}
