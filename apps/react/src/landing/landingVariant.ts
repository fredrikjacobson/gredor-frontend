import { type ReactNode, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import type { StartPageActions } from "@/landing/useStartPage.ts";
import { LandingPapper } from "@/landing/variants/LandingPapper.tsx";
import { LandingAng } from "@/landing/variants/LandingAng.tsx";
import { LandingVaxande } from "@/landing/variants/LandingVaxande.tsx";
import "@/landing/landing.css";

/** Layoutvarianterna får exakt startsidans ingångar och inget annat. */
export type LandingVariantProps = StartPageActions;

export type LandingVariant = "papper" | "ang" | "vaxande";

/**
 * Varianten e2e alltid landar på: noll rörelse, ingen canvas. Testerna skickar
 * aldrig ?variant och startar med tom localStorage, så de kör alltid den här.
 */
export const DEFAULT_LANDING_VARIANT: LandingVariant = "papper";

export const LANDING_VARIANT_STORAGE_KEY = "gredor.landingVariant";

export const LANDING_VARIANTS: Record<
  LandingVariant,
  {
    /** Kortnamn i växlaren. Får ALDRIG innehålla en knapptext ur
     *  ACTION_LABELS — Playwright matchar tillgängliga namn som delsträng. */
    key: string;
    label: string;
    component: (props: LandingVariantProps) => ReactNode;
  }
> = {
  papper: { key: "A", label: "Papper", component: LandingPapper },
  ang: { key: "B", label: "Levande äng", component: LandingAng },
  vaxande: { key: "C", label: "Växande", component: LandingVaxande },
};

export const LANDING_VARIANT_ORDER: LandingVariant[] = [
  "papper",
  "ang",
  "vaxande",
];

export function isLandingVariant(value: unknown): value is LandingVariant {
  return typeof value === "string" && value in LANDING_VARIANTS;
}

/**
 * ?variant= → localStorage → DEFAULT_LANDING_VARIANT.
 *
 * URL:en vinner så att skärmdumpar och delade länkar blir deterministiska;
 * localStorage gör valet klibbigt när man navigerar till editorn och tillbaka.
 * Söksträngen läses imperativt i stället för via routerns `validateSearch` —
 * ett schema på "/" hade tvingat fram typade söksträngar i varje Link hit och
 * en ny routeTree.gen.ts, utan att ge något för en ren dev-växlare.
 */
export function useLandingVariant(): LandingVariant {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  return useMemo(() => {
    const fromUrl = new URLSearchParams(searchStr).get("variant");
    if (isLandingVariant(fromUrl)) return fromUrl;

    try {
      const stored = localStorage.getItem(LANDING_VARIANT_STORAGE_KEY);
      if (isLandingVariant(stored)) return stored;
    } catch {
      // Privat läge / blockerad storage: fall tillbaka på standardvarianten.
    }

    return DEFAULT_LANDING_VARIANT;
  }, [searchStr]);
}
