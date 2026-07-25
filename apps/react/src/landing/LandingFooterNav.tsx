import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils.ts";

/**
 * Startsidan renderas utan SiteFooter (ren landningssida), så integritets-
 * policyn måste gå att nå härifrån. Delad mellan varianterna för att den inte
 * ska kunna falla bort i en av dem.
 */
export function LandingFooterNav({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "flex items-center justify-center gap-4 text-sm text-ink-light",
        className,
      )}
    >
      <Link to="/om-gredor" className="hover:text-ink">
        Om Gredor
      </Link>
      <span aria-hidden>·</span>
      <Link to="/integritetspolicy" className="hover:text-ink">
        Integritetspolicy
      </Link>
    </nav>
  );
}
