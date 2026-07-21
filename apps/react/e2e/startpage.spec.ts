import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

/** Stänger eventuella meddelande-modaler (SIE-varningar, backend-fel) via OK. */
async function dismissModals(page: Page) {
  const ok = page.getByRole("button", { name: "OK", exact: true });
  while (await ok.first().isVisible().catch(() => false)) {
    await ok.first().click();
    await page.waitForTimeout(100);
  }
}

/**
 * Rök-test för startsidans ingångar (Fas 4): ny årsredovisning via dialog,
 * öppna .gredorfardig-fil, samt SIE-import. Backend-anropet för
 * företagsuppslagning stubbas som fel så vi testar den robusta nedgraderingen.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(here, "../../../cypress/fixtures");

test.beforeEach(async ({ page }) => {
  // Företagsuppslagningen får misslyckas → dialogen ska ändå kunna skapa rapporten.
  await page.route("**/v1/information/records/**", (route) =>
    route.fulfill({ status: 500, json: {} }),
  );
});

test("ny årsredovisning via dialog landar i editorn med orgnr", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Börja" }).click();

  await page
    .getByTestId("new-arsredovisning-modal-orgnr")
    .fill("5560021361");
  await page.getByTestId("new-arsredovisning-create").click();

  await expect(page).toHaveURL(/\/redigera/);
  await expect(page.locator("#organisationsnummer")).toHaveValue(/556002.?1361/);
});

test("öppna .gredorfardig-fil laddar rapporten i editorn", async ({ page }) => {
  await page.goto("/");
  // Filväljaren är dold; sätt filen direkt på inputen.
  await page
    .locator('input[type="file"][accept*=".gredorfardig"]')
    .setInputFiles(path.join(FIXTURES_DIR, "input/gredor/TestfilA.gredorfardig"));

  await expect(page).toHaveURL(/\/redigera/);
  await expect(
    page.locator(".arsredovisning-content").getByText("Exempelbolaget AB").first(),
  ).toBeVisible({ timeout: 15_000 });
});

test("SIE-import förfyller resultaträkningen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Börja" }).click();

  await page
    .getByTestId("new-arsredovisning-modal-orgnr")
    .fill("5560021361");
  await page
    .locator('input[type="file"][accept*=".sie"]')
    .setInputFiles(path.join(FIXTURES_DIR, "input/sie/SIETest.se"));

  // SIE-import körs asynkront (knappen är "busy"); vänta tills den är klar och
  // stäng ev. varningsmodal innan vi trycker "Skapa".
  const create = page.getByTestId("new-arsredovisning-create");
  await expect(create).toBeEnabled({ timeout: 15_000 });
  await dismissModals(page);
  await expect(create).toBeEnabled();
  await create.click();
  // Backend-uppslagningen (stubbad 500) visar en varningsmodal.
  await dismissModals(page);

  await expect(page).toHaveURL(/\/redigera/);

  // Resultaträkningen ska nu ha minst en förifylld belopprad.
  await page.getByRole("button", { name: "Resultaträkning" }).click();
  const inputs = page.locator(".edit-belopprad-table input.belopprad-input");
  await expect(inputs.first()).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(
      async () => {
        const values = await inputs.evaluateAll((els) =>
          (els as HTMLInputElement[]).map((e) => e.value),
        );
        return values.filter((v) => /\d/.test(v)).length;
      },
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);
});
