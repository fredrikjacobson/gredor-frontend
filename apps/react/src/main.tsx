import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpikeHarness } from "@/spike/SpikeHarness.tsx";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <SpikeHarness />
  </StrictMode>,
);
