import { test, expect } from '../testSetup';
import { openFranchiseDashboard } from '../helpers';

test('franchisee creates a store', async ({ page }) => {
  await openFranchiseDashboard(page);

  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading', { name: 'Create store' })).toBeVisible();
  await page.getByPlaceholder('store name').fill('Provo');
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Provo/ })).toContainText('0 ₿');
});
