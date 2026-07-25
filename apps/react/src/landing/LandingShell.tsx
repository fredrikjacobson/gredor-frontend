import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";
import { usePrefersReducedMotion } from "@/landing/usePrefersReducedMotion.ts";

/**
 * Gemensamt skal för alla layoutvarianter. Reglerna här är inte kosmetiska:
 *
 *  - `isolate` är OBLIGATORISKT. Utan en egen stacking context målas ett
 *    `-z-10`-lager under <body> och rotens ogenomskinliga bakgrunder, och
 *    bakgrunden syns inte alls (exakt den buggen fanns i den gamla startsidan).
 *    isolation skapar en stacking context men INGEN containing block, så det
 *    fixerade lagret förblir viewport-fäst.
 *  - `overflow-x-clip`, inte `overflow-hidden`: det senare klipper även
 *    absolutpositionerad dekor i höjdled.
 *  - `min-h-full`, inte `h-full`: varianterna är olika höga och en variant utan
 *    scroll ska ändå fylla ytan.
 *  - Ingen `filter`, `backdrop-filter`, `will-change`, `transform` eller
 *    `contain` får läggas här (eller på <main>/approten). Var och en gör
 *    wrappern till containing block, och då blir det "fixerade" bakgrunds-
 *    lagret lika högt som sidans scrollhöjd och åker med när man scrollar.
 */
export function LandingShell({
  background,
  children,
  className,
}: {
  background: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  // Anropas här, inte bara i SeedCanvas: hookens dev-överstyrning (?motion=off)
  // sätter data-gredor-motion på <html>, och den attributselektorn är det enda
  // som stänger av variant B:s rena CSS-animationer. Utan anropet här skulle
  // överstyrningen bara fungera i den variant som råkar ha en canvas.
  usePrefersReducedMotion();

  return (
    <div
      className={cn("relative isolate min-h-full overflow-x-clip", className)}
    >
      {background}
      <div className="relative">{children}</div>
    </div>
  );
}
