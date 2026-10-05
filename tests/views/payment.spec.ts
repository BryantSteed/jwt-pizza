import { test, expect } from '../testSetup';
import { openPayment } from '../helpers';

test('payment shows the order', async ({ page }) => {
  await openPayment(page);

  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.getByRole('row', { name: /Veggie/ })).toContainText('0.004 ₿');
  await expect(page.getByRole('row', { name: /Pepperoni/ })).toContainText('0.004 ₿');
  await expect(page.locator('tfoot')).toContainText('2 pies');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
});

test('payment for a single pizza', async ({ page }) => {
  await openPayment(page, ['Veggie']);

  await expect(page.getByRole('main')).toContainText('Send me that pizza right now!');
  await expect(page.locator('tfoot')).toContainText('1 pie');
  await expect(page.locator('tfoot')).not.toContainText('1 pies');
});

test('pay now goes to delivery', async ({ page }) => {
  await openPayment(page);
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByRole('heading', { name: 'Here is your JWT Pizza!' })).toBeVisible();
});

test('cancel returns to the menu and keeps the order', async ({ page }) => {
  await openPayment(page);
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('heading', { name: 'Awesome is a click away' })).toBeVisible();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await expect(page.getByRole('combobox')).toHaveValue('4');
});

test('failed payment shows an error', async ({ page }) => {
  await openPayment(page);
  await page.route('*/**/api/order', async (route) => {
    await route.fulfill({ status: 500, json: { message: 'Failed to fulfill order at factory' } });
  });
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByRole('main')).toContainText('Failed to fulfill order at factory');
  await expect(page.getByRole('main')).not.toContainText('Send me those 2 pizzas right now!');
  await expect(page.getByRole('heading', { name: 'So worth it' })).toBeVisible();
});
