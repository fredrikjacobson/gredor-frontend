import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Skicka-in-guiden är numera en dialog i editorn (SendWizardDialog).
 * Den gamla routade sidan omdirigerar därför till editorn.
 */
export const Route = createFileRoute("/skicka-in/$step")({
  beforeLoad: () => {
    throw redirect({ to: "/redigera" });
  },
});
