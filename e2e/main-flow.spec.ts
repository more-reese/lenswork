import { expect, test } from "@playwright/test";

/**
 * Main journey in demo mode: open the seeded sample, parse, review the case
 * model, run all eight lenses, and verify distinct lens output plus
 * synthesis with preserved conflict. Cleans up its case afterwards.
 */
test("one case through eight lenses", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lenswork" })).toBeVisible();

  // Create a case from the flagship sample.
  await page.getByRole("button", { name: /The three-day office mandate/ }).click();
  await page.waitForURL(/\/case\//);
  const caseId = page.url().split("/case/")[1];

  // Intake is pre-filled; parse it.
  await expect(page.getByLabel("Case title")).toHaveValue("The three-day office mandate");
  await page.getByRole("button", { name: "Parse the case" }).click();

  // Case model review: user-stated facts separated from claims and assumptions.
  await expect(page.getByRole("heading", { name: "Check the case model" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Facts (as you stated them)")).toBeVisible();
  await expect(page.getByText("Assumptions (3)")).toBeVisible();

  // Approve and run everything.
  await page.getByRole("button", { name: "Looks right — continue to analysis" }).click();
  await page.getByRole("button", { name: "Run all eight lenses" }).click();

  // All eight lenses complete (mock runs in a few seconds), then synthesis.
  await expect(page.getByLabel("8. Dialectical reasoning — status: done")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByLabel("1. Interpretive & phenomenological — status: done")).toBeVisible();

  // Deduction: validity distinguished from premise truth.
  await page.getByLabel("4. Deductive reasoning — status: done").click();
  await expect(page.getByText("Structure: valid")).toBeVisible();
  await expect(page.getByText("Could all premises be true while the conclusion is false?")).toBeVisible();

  // Every diagram has a structured-list (screen-reader) twin.
  await page.getByRole("tab", { name: "Structured list" }).click();
  await expect(page.getByText(/Relations \(\d+\)/)).toBeVisible();

  // Systems: loops are hypotheses, with R/B markers.
  await page.getByLabel("6. Systems reasoning — status: done").click();
  await expect(page.getByText("Qualitative map — every loop is a hypothesis", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Attrition spiral/ })).toBeVisible();

  // Synthesis preserves conflict and offers a provisional, revisable judgment.
  await page.getByRole("button", { name: "Synthesis" }).last().click();
  await expect(page.getByText("Provisional judgment — explicitly revisable", { exact: false })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Where they conflict — preserved, not averaged")).toBeVisible();

  // Cleanup: remove the case created by this run.
  await request.delete(`/api/cases/${caseId}`);
});
