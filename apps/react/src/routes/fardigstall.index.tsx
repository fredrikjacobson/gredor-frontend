import { createFileRoute, redirect } from "@tanstack/react-router";

/** `/fardigstall` → första steget i färdigställ-flödet. */
export const Route = createFileRoute("/fardigstall/")({
  beforeLoad: () => {
    throw redirect({ to: "/fardigstall/$step", params: { step: "paminnelse" } });
  },
});
