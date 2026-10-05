import { test, expect } from '../testSetup';
import { openFranchiseDashboard } from '../helpers';

test('franchise page when logged out', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  await expect(page.getByRole('heading', { name: 'So you want a piece of the pie?' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('If you are already a franchisee');
  await expect(page.getByRole('alert').getByRole('link', { name: 'login' })).toBeVisible();
  await expect(page.getByRole('link', { name: '800-555-5555' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Franchise Fee' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unleash Your Potential' })).toBeVisible();
});

test('franchisee sees their stores', async ({ page }) => {
  await openFranchiseDashboard(page);

  await expect(page.getByRole('row', { name: /Lehi/ })).toContainText('1,500 ₿');
  await expect(page.getByRole('row', { name: /Springville/ })).toContainText('250 ₿');
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
});
