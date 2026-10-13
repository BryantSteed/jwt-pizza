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

test('admin sees users', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Kai Chen/ })).toContainText('d@jwt.com');
  await expect(page.getByRole('row', { name: /Kai Chen/ })).toContainText('diner');
  await expect(page.getByRole('row', { name: /Pizza Franchisee/ })).toContainText('f@jwt.com');
  await expect(page.getByRole('row', { name: /Pizza Franchisee/ })).toContainText('franchisee');
  await expect(page.getByRole('row', { name: /Pizza Admin/ })).toContainText('a@jwt.com');
  await expect(page.getByRole('row', { name: /Pizza Admin/ })).toContainText('admin');
});

test('user with several roles shows each role once', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: 'Mia Lopez' })).toContainText('diner, franchisee');
  await expect(page.getByRole('row', { name: 'Mia Lopez' })).not.toContainText('franchisee, franchisee');
});

test('admin pages through users', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 6' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 7' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous users' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next users' }).click();

  await expect(page.getByRole('row', { name: 'Diner 7' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 8' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next users' })).toBeDisabled();
  await page.getByRole('button', { name: 'Previous users' }).click();

  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 7' })).toHaveCount(0);
});

test('admin filters users by name', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeVisible();
  await page.getByPlaceholder('Filter users').fill('pizza');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Pizza Franchisee' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: 'Diner 1' })).toHaveCount(0);
});

test('clearing the user filter shows everyone again', async ({ page }) => {
  await openAdminDashboard(page);

  await page.getByPlaceholder('Filter users').fill('pizza');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toHaveCount(0);
  await page.getByPlaceholder('Filter users').fill('');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 1' })).toBeVisible();
});

test('user filter is kept while paging', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toBeVisible();
  await page.getByPlaceholder('Filter users').fill('e');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Next users' }).click();

  await expect(page.getByRole('row', { name: 'Diner 8' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 7' })).toHaveCount(0);
});

test('filtering users goes back to the first page', async ({ page }) => {
  await openAdminDashboard(page);

  await page.getByRole('button', { name: 'Next users' }).click();
  await expect(page.getByRole('row', { name: 'Diner 8' })).toBeVisible();
  await page.getByPlaceholder('Filter users').fill('Mia');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('row', { name: 'Mia Lopez' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 8' })).toHaveCount(0);
});

test('admin deletes a user', async ({ page }) => {
  await openAdminDashboard(page);

  await expect(page.getByRole('row', { name: 'Kai Chen' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 7' })).toHaveCount(0);
  await page.getByRole('row', { name: 'Kai Chen' }).getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByRole('row', { name: 'Kai Chen' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Diner 7' })).toBeVisible();
});

test('deleted user can no longer log in', async ({ page }) => {
  await openAdminDashboard(page);
  await page.getByRole('row', { name: 'Kai Chen' }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('row', { name: 'Kai Chen' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Logout' }).click();
  await login(page, 'd@jwt.com', 'a');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'KC' })).toHaveCount(0);
});

test('deleting the last user on a page goes back a page', async ({ page }) => {
  await openAdminDashboard(page);

  await page.getByRole('button', { name: 'Next users' }).click();
  await page.getByRole('row', { name: 'Diner 7' }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('row', { name: 'Diner 7' })).toHaveCount(0);
  await page.getByRole('row', { name: 'Diner 8' }).getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByRole('row', { name: 'Diner 8' })).toHaveCount(0);
  await expect(page.getByRole('row', { name: 'Pizza Admin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next users' })).toBeDisabled();
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
