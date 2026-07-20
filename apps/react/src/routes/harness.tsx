import { createFileRoute } from "@tanstack/react-router";
import { SpikeHarness } from "@/spike/SpikeHarness.tsx";

/**
 * Dev-rutt för fas 0-spiken: iXBRL-renderings-parity. Behålls som permanent
 * kontroll (jfr migrationsplanen) tills Playwright-varianten finns i fas 3.
 */
export const Route = createFileRoute("/harness")({
  component: SpikeHarness,
});
