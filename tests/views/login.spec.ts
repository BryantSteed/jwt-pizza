import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers';

test('login', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});
