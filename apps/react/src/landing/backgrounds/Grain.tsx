import { useId } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * Papperskorn som ett riktigt <svg>-element i stället för en CSS-data-URI:
 * ingen procentkodning, inget som ens kan hamna i en CSS-regel som iXBRL-
 * insamlaren skulle kunna plocka upp, och opacitet/blandläge stannar som
 * Tailwind-klasser.
 *
 * Turbulensen rastreras som en liten 180×180-bricka och kaklas. Att köra
 * fractalNoise över hela viewporten kostar tiotals millisekunder och rastreras
 * om vid varje resize. Av samma skäl får ingenting ovanför det här lagret
 * animeras — då rastreras bruset om varje bildruta.
 */
export function Grain({ className }: { className?: string }) {
  const id = useId();
  const filterId = `gredor-grain-${id}`;
  const patternId = `gredor-grain-pattern-${id}`;

  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className,
      )}
    >
      <defs>
        <filter id={filterId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
        <pattern
          id={patternId}
          width="180"
          height="180"
          patternUnits="userSpaceOnUse"
        >
          <rect width="180" height="180" filter={`url(#${filterId})`} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
