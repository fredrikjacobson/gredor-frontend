import { createFileRoute, redirect } from "@tanstack/react-router";

/** Skicka in är numera en dialog i editorn — omdirigera dit. */
export const Route = createFileRoute("/skicka-in/")({
  beforeLoad: () => {
    throw redirect({ to: "/redigera" });
  },
});
