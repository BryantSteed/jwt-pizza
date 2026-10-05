import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers';

test('logout', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'KC' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: "The web's best pizza" })).toBeVisible();
});
