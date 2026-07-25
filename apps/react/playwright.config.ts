import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright-konfiguration för React-appen. Kör mot dev-servern (Vite på 5176)
 * så att det dev-exponerade fakta-oraklet `window.__gredorParity` finns
 * tillgängligt — porten av Cypress `xbrloutput`-gaten (se e2e/xbrloutput.spec.ts).
 *
 * iXBRL-generering för TestfilD är tung; kör seriellt med generös timeout.
 */
// Porten kan flyttas via PORT (t.ex. när 5176 är upptagen av en annan
// arbetsyta) — vite.config.ts läser samma variabel.
const port = process.env.PORT ? Number(process.env.PORT) : 5176;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
