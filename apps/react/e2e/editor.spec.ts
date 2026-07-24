import { expect, test } from "@playwright/test";

/**
 * Rök-test för Fas 4-editorn: startsida → exempel → redigering → live-preview,
 * samt att färdigställ-/skicka-in-ingångarna finns. Kompletterar xbrloutput-
 * gaten (som täcker render/skicka-pipelinen) med regressionsskydd för
 * redigeringsloopen.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Visa exempel" }).click();
  await expect(page).toHaveURL(/\/redigera/);
});

test("redigering av företagsnamn uppdaterar A4-förhandsgranskningen", async ({
  page,
}) => {
  const input = page.locator("#foretagsnamn");
  await expect(input).toBeVisible();

  await input.fill("Testbolaget Smoke AB");

  // Förhandsgranskningen är öppen som standard; verifiera att företagsnamnet
  // renderas i försättsbladets ix:nonNumeric.
  await expect(
    page.locator(".arsredovisning-content").getByText("Testbolaget Smoke AB").first(),
  ).toBeVisible({ timeout: 15_000 });
});

test("editorn har sektionsstegare + färdigställ-/skicka-in-ingångar", async ({
  page,
}) => {
  await expect(
    page.getByRole("button", { name: /Färdigställ inför årsstämma/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Skicka in till Bolagsverket/ }),
  ).toBeVisible();

  // Byt sektion via flik-stegaren och verifiera att redigeringspanelen byts ut.
  await page.getByRole("tab", { name: "Resultaträkning" }).click();
  await expect(page.locator("#foretagsnamn")).toHaveCount(0);
  await expect(
    page.locator(".edit-belopprad-table").first(),
  ).toBeVisible({ timeout: 15_000 });
});

test("färdigställ-ingången öppnar påminnelsesteget", async ({ page }) => {
  await page
    .getByRole("button", { name: /Färdigställ inför årsstämma/ })
    .click();
  // Guiden är en modal (inte längre en egen rutt) och startar på påminnelsen.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Glöm inte…").first()).toBeVisible();
  // Påminnelsen listar notkopplingar när taxonomierna laddat.
  await expect(
    page.getByTestId("finalize-reminder-noter-connections-list"),
  ).toBeVisible({ timeout: 20_000 });
});
