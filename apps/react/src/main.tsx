import "@/styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/router.tsx";
import { queryClient } from "@/api/queryClient.ts";
import { initArsredovisningPersistence } from "@/stores/arsredovisningStore.ts";

// Koppla in autospar-persistensen (samma localStorage-nycklar som Vue-appen).
initArsredovisningPersistence();

// Dev-hjälp: exponera stores på window för manuell testning (bort i prod).
if (import.meta.env.DEV) {
  void import("@/stores/uiStore.ts").then(({ useUiStore }) => {
    (window as unknown as { __gredorUi?: unknown }).__gredorUi = useUiStore;
  });
  void import("@/stores/arsredovisningStore.ts").then(
    ({ useArsredovisningStore }) => {
      (window as unknown as { __gredorAr?: unknown }).__gredorAr =
        useArsredovisningStore;
    },
  );
  void import("@/stores/flowStore.ts").then(({ useFlowStore }) => {
    (window as unknown as { __gredorFlow?: unknown }).__gredorFlow =
      useFlowStore;
    // Wizard-driven paritetsorakel för Playwright-porten (xbrloutput):
    // kör fakta-diffen mot förväntad XML i webbläsaren på den ixbrl som
    // "generera"-steget lagt i flowStore.
    void Promise.all([
      import("@/parity/parityCheck.ts"),
      Promise.resolve(useFlowStore),
    ]).then(([{ runParityCheck }, store]) => {
      (
        window as unknown as {
          __gredorParity?: (expectedXml: string) => unknown;
        }
      ).__gredorParity = (expectedXml: string) => {
        const ixbrl = store.getState().ixbrl;
        if (!ixbrl) return { error: "ingen ixbrl genererad än" };
        return { changes: runParityCheck(ixbrl, expectedXml) };
      };
    });
  });
  (window as unknown as { __gredorRouter?: unknown }).__gredorRouter = router;
  void import("@/model/arsredovisning/Arsredovisning.ts").then(
    ({ upgradeArsredovisningObject }) => {
      (
        window as unknown as { __gredorUpgrade?: unknown }
      ).__gredorUpgrade = upgradeArsredovisningObject;
    },
  );
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
