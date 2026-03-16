import { test, expect } from '@playwright/test';

test('home page loads with Mission Control heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h2', { hasText: 'Mission Control' })).toBeVisible();
});
