import { test, expect } from '../testSetup';
import { basicInit, login, openDelivery } from '../helpers';

test('diner sees their details and order history', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Kai Chen');
  await expect(page.getByRole('main')).toContainText('d@jwt.com');
  await expect(page.getByRole('main')).toContainText('diner');
  await expect(page.getByRole('main')).toContainText('Here is your history of all the good times.');
  await expect(page.getByRole('row', { name: /2024-06-05/ })).toContainText('0.008 ₿');
});

test('user with no orders is invited to buy a pizza', async ({ page }) => {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'f');
  await page.getByRole('link', { name: 'PF' }).click();

  await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Franchisee on 9');
  await expect(page.getByRole('main')).toContainText('How have you lived this long without having a pizza?');
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByRole('link', { name: 'Buy one' }).click();

  await expect(page.getByRole('heading', { name: 'Awesome is a click away' })).toBeVisible();
});

test('new order shows in the order history', async ({ page }) => {
  await openDelivery(page);
  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
  await expect(page.getByRole('row', { name: /2024-06-05/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /2024-06-06/ })).toContainText('23');
  await expect(page.getByRole('row', { name: /2024-06-06/ })).toContainText('0.008 ₿');
});

test('edit opens a dialog with the user details', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Edit user' })).toBeVisible();
  await expect(dialog.getByLabel('name:')).toHaveValue('Kai Chen');
  await expect(dialog.getByLabel('email:')).toHaveValue('d@jwt.com');
  await expect(dialog.getByLabel('password:')).toHaveValue('');
});

test('cancel closes the edit dialog without changing the user', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('dialog').getByLabel('name:').fill('Someone Else');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('main')).toContainText('Kai Chen');
  await expect(page.getByRole('main')).not.toContainText('Someone Else');
});

test('update changes the user name', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('dialog').getByLabel('name:').fill('Kai Chenx');
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('main')).toContainText('Kai Chenx');
});

test('updated name is still there after logging back in', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('dialog').getByLabel('name:').fill('Kai Chenx');
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByRole('main')).toContainText('Kai Chenx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByRole('main')).toContainText('Kai Chenx');
});
