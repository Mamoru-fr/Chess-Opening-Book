import { test, expect } from '@playwright/test';

// Tests de fumée — le flux complet (signup -> ouverture -> coup) attend la Phase C
// et une base de test. L'ancien test (localStorage openingTreeNodes) testait un
// fonctionnement qui n'existe plus depuis le passage aux server actions.

test.describe('Smoke', () => {
  test('landing page loads with auth links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Chess Opening Book')).toBeVisible();
    await expect(page.getByRole('link', { name: /se connecter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /s'inscrire/i })).toBeVisible();
  });

  test('dashboard redirects unauthenticated users to signin', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth\/signin/);
  });
});
