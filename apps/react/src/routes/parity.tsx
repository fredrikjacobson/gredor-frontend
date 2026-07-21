import { createFileRoute } from "@tanstack/react-router";
import { ParityHarness } from "@/parity/ParityHarness.tsx";

/** Dev-rutt: fakta-nivå parity mot Testfil-fixturens förväntade XBRL. */
export const Route = createFileRoute("/parity")({
  component: ParityHarness,
});
