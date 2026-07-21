import { createFileRoute, redirect } from "@tanstack/react-router";

/** Färdigställ är numera en dialog i editorn — omdirigera dit. */
export const Route = createFileRoute("/fardigstall/")({
  beforeLoad: () => {
    throw redirect({ to: "/redigera" });
  },
});
