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
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
