import "@/styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router.tsx";
import { initArsredovisningPersistence } from "@/stores/arsredovisningStore.ts";

// Koppla in autospar-persistensen (samma localStorage-nycklar som Vue-appen).
initArsredovisningPersistence();

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
