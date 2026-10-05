import { test, expect } from '../testSetup';
import { openAdminDashboard, openFranchiseDashboard } from '../helpers';

test('franchisee closes a store', async ({ page }) => {
  await openFranchiseDashboard(page);

  await page.getByRole('row', { name: /Lehi/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Sorry to see you go' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the pizzaPocket store Lehi ?');
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Springville/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Lehi/ })).toHaveCount(0);
});

test('admin closes a store', async ({ page }) => {
  await openAdminDashboard(page);

  await page.getByRole('row', { name: /Spanish Fork/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Sorry to see you go' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the PizzaCorp store Spanish Fork ?');
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
  await expect(page.getByRole('row', { name: /PizzaCorp/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Spanish Fork/ })).toHaveCount(0);
});
