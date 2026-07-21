import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

/**
 * Rök-test för att-åtgärda-panelen (Fas 4). SIE-importens varningar skapar ett
 * todo-objekt ("sie-import") som vi sedan bockar av och tar bort.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(here, "../../../cypress/fixtures");

async function dismissModals(page: Page) {
  const ok = page.getByRole("button", { name: "OK", exact: true });
  while (await ok.first().isVisible().catch(() => false)) {
    await ok.first().click();
    await page.waitForTimeout(100);
  }
}

test("SIE-varningar hamnar i att-åtgärda-panelen och kan bockas av/tas bort", async ({
  page,
}) => {
  await page.route("**/v1/information/records/**", (route) =>
    route.fulfill({ status: 500, json: {} }),
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Börja" }).click();
  await page.getByTestId("new-arsredovisning-modal-orgnr").fill("5560021361");
  await page
    .locator('input[type="file"][accept*=".sie"]')
    .setInputFiles(path.join(FIXTURES_DIR, "input/sie/SIETest.se"));

  const create = page.getByTestId("new-arsredovisning-create");
  await expect(create).toBeEnabled({ timeout: 15_000 });
  await dismissModals(page);
  await create.click();
  await dismissModals(page);
  await expect(page).toHaveURL(/\/redigera/);

  // Todo-objektet från SIE-importen ska visas i panelen.
  const item = page.getByTestId("todo-list-item-sie-import");
  await expect(item).toBeVisible({ timeout: 15_000 });

  // Bocka av första uppgiften.
  const firstTask = page.getByTestId("todo-list-item-sie-import-task-0");
  await expect(firstTask).toHaveAttribute("aria-pressed", "false");
  await firstTask.click();
  await expect(firstTask).toHaveAttribute("aria-pressed", "true");

  // Ta bort hela objektet.
  await page.getByTestId("todo-list-item-delete-sie-import").click();
  await expect(item).toHaveCount(0);
});
