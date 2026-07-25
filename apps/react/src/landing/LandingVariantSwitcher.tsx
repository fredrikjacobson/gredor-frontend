import {
  LANDING_VARIANTS,
  LANDING_VARIANT_ORDER,
  LANDING_VARIANT_STORAGE_KEY,
  type LandingVariant,
} from "@/landing/landingVariant.ts";
import { cn } from "@/lib/utils.ts";

/**
 * Dev-växlare mellan startsidans layoutvarianter.
 *
 * Placering och märkning är e2e-kritisk:
 *  - nere till VÄNSTER, fritt från Sonner-toastern (bottom-right) och från den
 *    mobila varningsremsan högst upp;
 *  - z-40, inte z-50, så importguidens overlay täcker den och den inte går att
 *    klicka medan dialogen är öppen;
 *  - länkar (role=link) med namnen "A"/"B"/"C" — aldrig en text som innehåller
 *    "Börja", "Öppna", "Visa exempel" eller "OK", eftersom Playwright matchar
 *    tillgängliga namn som skiftlägesokänslig delsträng och getByRole i
 *    startpage.spec.ts då skulle träffa två element.
 *
 * Hela sidan laddas om vid byte. Det är avsiktligt: URL:en blir sanningen (så
 * skärmdumpar går att återskapa) och varje variant monteras rent, utan rester
 * av föregående variants canvas eller lyssnare.
 */
export function LandingVariantSwitcher({
  current,
}: {
  current: LandingVariant;
}) {
  const hrefFor = (variant: LandingVariant) => {
    const params = new URLSearchParams(window.location.search);
    params.set("variant", variant);
    return `/?${params.toString()}`;
  };

  return (
    <div
      data-testid="landing-variant-switcher"
      className="fixed bottom-3 left-3 z-40 flex items-center gap-1 rounded-full border bg-card/90 p-1 shadow-raised backdrop-blur"
    >
      {LANDING_VARIANT_ORDER.map((variant) => {
        const { key, label } = LANDING_VARIANTS[variant];
        const active = variant === current;
        return (
          <a
            key={variant}
            href={hrefFor(variant)}
            title={label}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              try {
                localStorage.setItem(LANDING_VARIANT_STORAGE_KEY, variant);
              } catch {
                // Blockerad storage: URL:en räcker.
              }
            }}
            className={cn(
              "grid size-7 place-items-center rounded-full text-xs font-semibold no-underline transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-ink-medium hover:bg-accent hover:text-ink",
            )}
          >
            {key}
          </a>
        );
      })}
    </div>
  );
}
