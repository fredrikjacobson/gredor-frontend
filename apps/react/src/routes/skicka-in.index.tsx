import { createFileRoute, redirect } from "@tanstack/react-router";

/** `/skicka-in` → första steget i skicka-in-flödet. */
export const Route = createFileRoute("/skicka-in/")({
  beforeLoad: () => {
    throw redirect({ to: "/skicka-in/$step", params: { step: "filer" } });
  },
});
