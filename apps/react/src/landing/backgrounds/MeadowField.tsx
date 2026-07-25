import { Grain } from "@/landing/backgrounds/Grain.tsx";

/**
 * Variant B: fyra stora, suddiga färgfält som driver långsamt förbi varandra.
 *
 * Rörelsen bor i .gredor-landing-blob-* (landing.css) och animerar ENBART
 * transform, dvs. den stannar på kompositortråden och orsakar varken layout
 * eller ommålning. `blur()` ligger på fälten själva — aldrig på wrappern, som
 * då hade blivit containing block och tagit ifrån det fixerade lagret dess
 * viewport-förankring.
 */
export function MeadowField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface"
    >
      <div className="gredor-landing-blob gredor-landing-blob-1 -left-[18%] -top-[22%] size-[40rem] bg-[color-mix(in_srgb,var(--color-primary)_72%,transparent)] blur-[90px]" />
      <div className="gredor-landing-blob gredor-landing-blob-2 -right-[14%] -top-[14%] size-[32rem] bg-[color-mix(in_srgb,var(--color-secondary)_58%,transparent)] blur-[90px]" />
      <div className="gredor-landing-blob gredor-landing-blob-3 -bottom-[28%] left-[14%] size-[38rem] bg-[color-mix(in_srgb,var(--color-primary-light)_68%,transparent)] blur-[100px]" />
      <div className="gredor-landing-blob gredor-landing-blob-4 -right-[8%] bottom-[2%] size-[26rem] bg-[color-mix(in_srgb,var(--color-warning)_45%,transparent)] blur-[100px]" />

      {/* Ljusar upp mitten så texten alltid har kontrast oavsett var fälten
          råkar befinna sig i sin cykel. Tät kärna, snabb uttoning — annars
          mjölkas hela ytan och färgerna blir gråa. */}
      <div className="absolute inset-0 bg-[radial-gradient(58%_46%_at_50%_34%,var(--color-surface)_0%,color-mix(in_srgb,var(--color-surface)_88%,transparent)_45%,transparent_78%)]" />

      <Grain className="opacity-[0.035] mix-blend-multiply" />
    </div>
  );
}
