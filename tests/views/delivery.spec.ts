import { test, expect } from '../testSetup';
import { basicInit, openDelivery } from '../helpers';

test('delivery shows the order', async ({ page }) => {
  await openDelivery(page);

  await expect(page.getByRole('main')).toContainText('order ID: 23');
  await expect(page.getByRole('main')).toContainText('pie count: 2');
  await expect(page.getByRole('main')).toContainText('0.008 ₿');
  await expect(page.getByText('eyJpYXQ')).toBeVisible();
});

test('verify shows a valid pizza', async ({ page }) => {
  await openDelivery(page);
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.getByRole('heading', { name: 'JWT Pizza - valid' })).toBeVisible();
  await expect(page.locator('pre')).toContainText('JWT Pizza Headquarters');
});

test('verify shows an invalid pizza', async ({ page }) => {
  await basicInit(page);
  await page.goto('/delivery');
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.getByRole('heading', { name: 'JWT Pizza - invalid' })).toBeVisible();
  await expect(page.locator('pre')).toContainText('invalid JWT. Looks like you have a bad pizza!');
});

test('order more returns to the menu', async ({ page }) => {
  await openDelivery(page);
  await page.getByRole('button', { name: 'Order more' }).click();

  await expect(page.getByRole('heading', { name: 'Awesome is a click away' })).toBeVisible();
  await expect(page.locator('form')).toContainText('What are you waiting for?');
});
