import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

/** Stänger eventuella meddelande-modaler (SIE-varningar, backend-fel) via OK. */
async function dismissModals(page: Page) {
  const ok = page.getByRole("button", { name: "OK", exact: true });
  while (
    await ok
      .first()
      .isVisible()
      .catch(() => false)
  ) {
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

/**
 * Startsidan finns i tre layoutvarianter (src/landing/). Alla knapptexter
 * kommer från ACTION_LABELS, och Playwright matchar tillgängliga namn som
 * skiftlägesokänslig DELSTRÄNG — så ett nytt element vars namn råkar innehålla
 * "Börja" (t.ex. en variantväxlare eller en andra CTA) skulle få getByRole att
 * träffa två element och alla testerna nedan att falla på strict mode. Den här
 * kontrollen gör det till ett tydligt fel i stället för en gåta.
 */
test("startsidan exponerar exakt en Börja-knapp", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Börja" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Visa exempel" })).toHaveCount(
    1,
  );
  await expect(
    page.locator('input[type="file"][accept*=".gredorfardig"]'),
  ).toHaveCount(1);
});

test("ny årsredovisning via dialog landar i editorn med orgnr", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Börja" }).click();

  // Dialogen har två steg: SIE-import (frivillig) → företagsuppgifter.
  await page.getByTestId("new-arsredovisning-next").click();
  await page.getByTestId("new-arsredovisning-modal-orgnr").fill("5560021361");
  await page.getByTestId("new-arsredovisning-create").click();

  await expect(page).toHaveURL(/\/redigera/);
  await expect(page.locator("#organisationsnummer")).toHaveValue(
    /556002.?1361/,
  );
});

test("öppna .gredorfardig-fil laddar rapporten i editorn", async ({ page }) => {
  await page.goto("/");
  // Filväljaren är dold; sätt filen direkt på inputen.
  await page
    .locator('input[type="file"][accept*=".gredorfardig"]')
    .setInputFiles(
      path.join(FIXTURES_DIR, "input/gredor/TestfilA.gredorfardig"),
    );

  await expect(page).toHaveURL(/\/redigera/);
  // Förhandsgranskningen är öppen som standard.
  await expect(
    page
      .locator(".arsredovisning-content")
      .getByText("Exempelbolaget AB")
      .first(),
  ).toBeVisible({ timeout: 15_000 });
});

test("SIE-import förfyller resultaträkningen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Börja" }).click();

  // Steg 1 i dialogen är SIE-importen.
  await page
    .locator('input[type="file"][accept*=".sie"]')
    .setInputFiles(path.join(FIXTURES_DIR, "input/sie/SIETest.se"));

  // SIE-import körs asynkront (knappen är "busy"); vänta tills den är klar och
  // stäng ev. varningsmodal innan vi går vidare till steg 2.
  const next = page.getByTestId("new-arsredovisning-next");
  await expect(next).toBeEnabled({ timeout: 15_000 });
  await dismissModals(page);
  await next.click();

  // Steg 2: organisationsnumret kan vara förifyllt från SIE-filen.
  await page.getByTestId("new-arsredovisning-modal-orgnr").fill("5560021361");
  const create = page.getByTestId("new-arsredovisning-create");
  await expect(create).toBeEnabled();
  await create.click();
  // Backend-uppslagningen (stubbad 500) visar en varningsmodal.
  await dismissModals(page);

  await expect(page).toHaveURL(/\/redigera/);

  // Resultaträkningen ska nu ha minst en förifylld belopprad.
  await page.getByRole("tab", { name: "Resultaträkning" }).click();
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
