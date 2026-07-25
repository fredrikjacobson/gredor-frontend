import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Wizard-driven port av cypress/e2e/xbrloutput.cy.ts (Fas 5-gaten, uppskjuten
 * från Fas 3). Kör hela skicka-in-wizarden mot dev-servern för var och en av de
 * fyra Testfil-fixturerna, med en fastnaglad klocka (2025-09-27), och asserterar
 * att den genererade iXBRL:en är fakta-identisk med den förväntade XBRL:en.
 *
 * Fakta-diffen körs i webbläsaren via `window.__gredorParity` (samma
 * convertiXBRLToXBRL + json-diff-ts-orakel som Cypress), så domänkoden behöver
 * inte importeras i Node. Input-.gredorfardig och förväntad XML läses direkt ur
 * det delade cypress/fixtures/ (samma sanning som Vue-appens gate).
 */

const FIXTURES_DIR = path.resolve(here, "../../../cypress/fixtures");
const CLOCK = new Date("2025-09-27T12:00:00");

interface FaststallelseintygCase {
  godkannaStyrelsensForslag: boolean;
  datum: string;
  avsattningTillReservfond?: string;
  balanseringINyRakning?: string;
}

const CASES: { name: string; faststallelseintyg: FaststallelseintygCase }[] = [
  { name: "TestfilA", faststallelseintyg: { godkannaStyrelsensForslag: true, datum: "2025-01-20" } },
  {
    name: "TestfilB",
    faststallelseintyg: {
      godkannaStyrelsensForslag: false,
      avsattningTillReservfond: "10000",
      balanseringINyRakning: "71801",
      datum: "2025-01-20",
    },
  },
  { name: "TestfilC", faststallelseintyg: { godkannaStyrelsensForslag: true, datum: "2025-04-28" } },
  { name: "TestfilD", faststallelseintyg: { godkannaStyrelsensForslag: true, datum: "2025-09-27" } },
];

const nextButton = (page: Page) => page.getByTestId("wizard-next-button");

async function clickNext(page: Page) {
  const btn = nextButton(page);
  await expect(btn).toBeEnabled();
  await btn.click();
}

/**
 * Öppnar skicka-in-guiden. Guiden är en dialog i editorn (tidigare den routade
 * sidan `/skicka-in/filer`, som numera omdirigerar till `/redigera`), och
 * editorn kräver en öppen rapport — därför laddas exemplet först. Vilken
 * rapport editorn visar spelar ingen roll för gaten: guiden arbetar mot den
 * .gredorfardig-fil som laddas upp i steg 1 (flowStore), inte mot editorns.
 */
async function openSendWizard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Visa exempel" }).click();
  await expect(page).toHaveURL(/\/redigera/);
  await page
    .getByRole("button", { name: "Skicka in till Bolagsverket" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

for (const { name, faststallelseintyg } of CASES) {
  test(`genererar fakta-identisk XBRL för ${name}.gredorfardig`, async ({ page }) => {
    // Fastnaglad klocka så fastställelseintygets underskriftsdatum (new Date())
    // matchar den förväntade XML:en. Timers fortsätter gå (setFixedTime).
    await page.clock.setFixedTime(CLOCK);

    // Backend-stubbar (som cy.intercept i xbrloutput.cy.ts).
    await page.route("**/v1/auth/status", (route) =>
      route.fulfill({ json: { loggedIn: true } }),
    );
    await page.route("**/v1/submission-flow/prepare", (route) =>
      route.fulfill({ json: { avtalstext: "Exempeltext", avtalstextAndrad: "2025-07-28" } }),
    );

    // Steg 1 — Ladda upp fil
    await openSendWizard(page);
    await page
      .getByTestId("send-wizard-gredor-file-input")
      .setInputFiles(path.join(FIXTURES_DIR, "input/gredor", `${name}.gredorfardig`));
    await clickNext(page);

    // Steg 2 — Uppgifter
    await page.getByTestId("send-wizard-personalnumber-input").fill("191212121212");
    await page.getByTestId("send-wizard-email-input").fill("example@example.com");
    await clickNext(page);

    // Steg 3 — BankID (auth/status stubbad → redan legitimerad)
    await expect(page.getByTestId("send-wizard-bankid-complete")).toBeVisible();
    await clickNext(page);

    // Steg 4 — Bolagsverkets villkor
    await page.locator("#bolagsverketAgreementCheck").check();
    await clickNext(page);

    // Steg 5 — Fastställelseintyg
    await page.locator("#datumArsstamma").fill(faststallelseintyg.datum);
    await page.locator("#tilltalsnamn").fill("Karl");
    await page.locator("#efternamn").fill("Karlsson");
    await page.locator("#roll").selectOption("Styrelseledamot");
    if (faststallelseintyg.godkannaStyrelsensForslag) {
      await page
        .locator("#resultatdispositionBeslut")
        .selectOption("Årsstämman beslöt att godkänna styrelsens förslag till vinstdisposition.");
    } else {
      await page
        .locator("#resultatdispositionBeslut")
        .selectOption("Årsstämman beslöt att inte godkänna styrelsens förslag till vinstdisposition.");
      if (faststallelseintyg.avsattningTillReservfond) {
        await page
          .locator("#resultatdispositionBeslutEgen-avsattningTillReservfond")
          .fill(faststallelseintyg.avsattningTillReservfond);
      }
      if (faststallelseintyg.balanseringINyRakning) {
        await page
          .locator("#resultatdispositionBeslutEgen-balanseringINyRakning")
          .fill(faststallelseintyg.balanseringINyRakning);
      }
    }
    await clickNext(page);

    // Steg 6 — Generera: vänta tills iXBRL:en är klar (Nästa aktiveras).
    await expect(nextButton(page)).toBeEnabled({ timeout: 90_000 });

    // Fakta-diff mot förväntad XBRL, i webbläsaren.
    const expectedXml = fs.readFileSync(
      path.join(FIXTURES_DIR, "expectedoutput/gredor", `${name}.xml`),
      "utf-8",
    );
    const result = await page.evaluate((xml) => {
      const parity = (window as unknown as {
        __gredorParity?: (xml: string) => { changes?: { type: string; key: string }[]; error?: string };
      }).__gredorParity;
      if (!parity) return { error: "__gredorParity saknas (dev-exponering?)" };
      return parity(xml);
    }, expectedXml);

    expect(result.error, result.error).toBeUndefined();
    expect(
      result.changes,
      `Fakta-skillnader mot ${name}.xml:\n${JSON.stringify(result.changes, null, 2)}`,
    ).toEqual([]);
  });
}
