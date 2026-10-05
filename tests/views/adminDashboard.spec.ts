import { test, expect } from '../testSetup';
import { basicInit, login, openAdminDashboard } from '../helpers';

test('admin sees franchises', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: /LotaPizza/ })).toContainText('Lota Owner');
  await expect(page.getByRole('row', { name: /Lehi/ })).toContainText('4,200 ₿');
  await expect(page.getByRole('row', { name: /PizzaCorp/ })).toContainText('Corp Owner');
  await expect(page.getByRole('row', { name: /Spanish Fork/ })).toContainText('75 ₿');
  await expect(page.getByRole('row', { name: /topSpot/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /pizzaPocket/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
});

test('admin pages through franchises', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: /LotaPizza/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '«' })).toBeDisabled();
  await page.getByRole('button', { name: '»' }).click();

  await expect(page.getByRole('row', { name: /pizzaPocket/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /LotaPizza/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '»' })).toBeDisabled();
  await page.getByRole('button', { name: '«' }).click();

  await expect(page.getByRole('row', { name: /LotaPizza/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /pizzaPocket/ })).toHaveCount(0);
});

test('admin filters franchises', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: /LotaPizza/ })).toBeVisible();
  await page.getByPlaceholder('Filter franchises').fill('Corp');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByRole('row', { name: /LotaPizza/ })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /PizzaCorp/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /topSpot/ })).toHaveCount(0);
});

test('admin dashboard is not found for a diner', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  await expect(page.getByLabel('Global').getByRole('link', { name: 'Admin' })).toHaveCount(0);
  await page.goto('/admin-dashboard');

  await expect(page.getByRole('heading', { name: 'Oops' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor.');
});
