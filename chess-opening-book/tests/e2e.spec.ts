import { test, expect } from '@playwright/test';

test.describe('Opening flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('create opening and add move e4', async ({ page }) => {
    // Click the sidebar button to create a new opening
    const newBtn = page.locator('button', { hasText: 'Nouvelle Ouverture' }).first();
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    // Find the node in the canvas and double-click it to open the modal
    const node = page.locator('.node').filter({ hasText: 'Nouvelle Ouverture' }).first();
    await expect(node).toBeVisible();
    const handle = await node.elementHandle();
    if (!handle) throw new Error('node handle missing');
    await page.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    }, handle);
    await page.waitForTimeout(200);

    // Fill the modal input and add move
    const input = page.locator('.opening-tree input').first();
    await expect(input).toBeVisible();
    await input.fill('e4');
    const addBtn = page.getByRole('button', { name: /Ajouter/i }).first();
    await addBtn.click();

    // Verify localStorage has the node with the move
    const nodesLS = await page.evaluate(() => localStorage.getItem('openingTreeNodes'));
    expect(nodesLS).toBeTruthy();
    const parsed = JSON.parse(nodesLS || '[]');
    expect(parsed.length).toBeGreaterThan(0);
    // ensure some node includes the move text
    const found = JSON.stringify(parsed).includes('e4');
    expect(found).toBeTruthy();
  });
});
