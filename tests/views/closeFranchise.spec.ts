import { test, expect } from '../testSetup';
import { openAdminDashboard } from '../helpers';

test('admin closes a franchise', async ({ page }) => {
  await openAdminDashboard(page);

  await page.getByRole('row', { name: /PizzaCorp/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Sorry to see you go' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the PizzaCorp franchise?');
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
  await expect(page.getByRole('row', { name: /LotaPizza/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /PizzaCorp/ })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /Spanish Fork/ })).toHaveCount(0);
});
