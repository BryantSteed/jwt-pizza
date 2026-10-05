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
