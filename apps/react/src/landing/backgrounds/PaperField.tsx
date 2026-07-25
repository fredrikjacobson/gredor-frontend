import { Grain } from "@/landing/backgrounds/Grain.tsx";

/**
 * Variant A: varmt kontorspapper. Allt utom kornet är gradienter skrivna som
 * Tailwind-arbitrary values, vilket gör dem bevisligen läckagesäkra — Tailwind
 * v4 lägger alla utilities i @layer utilities, och iXBRL-insamlaren hoppar över
 * @layer-block.
 *
 * Ligger `fixed` så att pappersytan står stilla medan innehållet scrollar
 * (sidan scrollar i <main>, inte i fönstret).
 */
export function PaperField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-surface"
    >
      {/* Linjerat konto-papper, uttonat mot kanterna så det aldrig blir rutnät. */}
      <div className="absolute inset-0 [background-image:repeating-linear-gradient(to_bottom,transparent_0px,transparent_27px,color-mix(in_srgb,var(--color-primary)_14%,transparent)_27px,color-mix(in_srgb,var(--color-primary)_14%,transparent)_28px)] [mask-image:radial-gradient(115%_85%_at_50%_0%,black_15%,transparent_78%)]" />

      {/* Marginallinjen i en huvudbok — placerad vid textkolumnens vänsterkant. */}
      <div className="absolute inset-y-0 left-[max(1.5rem,calc(50%-33rem))] w-px bg-[color-mix(in_srgb,var(--color-secondary)_45%,transparent)] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_65%,transparent)]" />

      {/* Två mjuka ljusfält: oliv uppe till vänster, lera uppe till höger. */}
      <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_18%_0%,color-mix(in_srgb,var(--color-primary)_20%,transparent),transparent_70%),radial-gradient(40%_45%_at_88%_8%,color-mix(in_srgb,var(--color-secondary)_16%,transparent),transparent_70%)]" />

      <Grain className="opacity-[0.05] mix-blend-multiply" />

      {/* Vinjett: håller blicken i mitten utan att synas som en ring. */}
      <div className="absolute inset-0 bg-[radial-gradient(105%_105%_at_50%_35%,transparent_55%,color-mix(in_srgb,var(--color-ink)_9%,transparent))]" />
    </div>
  );
}
