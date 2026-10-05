import { test, expect } from '../testSetup';
import { openAdminDashboard } from '../helpers';

test('admin creates a franchise', async ({ page }) => {
  await openAdminDashboard(page);

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await expect(page.getByRole('heading', { name: 'Create franchise' })).toBeVisible();
  await page.getByPlaceholder('franchise name').fill('pizzaPlanet');
  await page.getByPlaceholder('franchisee admin email').fill('p@jwt.com');
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
  await page.getByRole('button', { name: '»' }).click();
  await expect(page.getByRole('row', { name: /pizzaPlanet/ })).toContainText('New Franchisee');
});
