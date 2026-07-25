import { createFileRoute } from "@tanstack/react-router";
import { useStartPage } from "@/landing/useStartPage.ts";
import { StartPageChrome } from "@/landing/StartPageChrome.tsx";
import {
  LANDING_VARIANTS,
  useLandingVariant,
} from "@/landing/landingVariant.ts";
import { LandingVariantSwitcher } from "@/landing/LandingVariantSwitcher.tsx";

export const Route = createFileRoute("/")({
  component: StartPage,
});

/**
 * Startsidan finns i tre layoutvarianter (se src/landing/landingVariant.ts).
 * Rutten äger beteendet och "chrome":t; varianten får bara ingångarna som
 * props. StartPageChrome är därför ett SYSKON till varianten — den dolda
 * filinputen och importguiden kan inte flyttas, avmonteras eller lindas in av
 * en variant, och e2e-testerna är oberoende av vilken variant som är aktiv.
 */
function StartPage() {
  const { actions, chrome } = useStartPage();
  const variant = useLandingVariant();
  const Variant = LANDING_VARIANTS[variant].component;

  return (
    <>
      <Variant {...actions} />
      <StartPageChrome {...chrome} />
      {import.meta.env.DEV && <LandingVariantSwitcher current={variant} />}
    </>
  );
}
