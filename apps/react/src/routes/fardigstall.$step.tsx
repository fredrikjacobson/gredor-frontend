import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Färdigställ-guiden är numera en dialog i editorn (FinalizeWizardDialog).
 * Den gamla routade sidan omdirigerar därför till editorn.
 */
export const Route = createFileRoute("/fardigstall/$step")({
  beforeLoad: () => {
    throw redirect({ to: "/redigera" });
  },
});
