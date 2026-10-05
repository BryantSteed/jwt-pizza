import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers';

test('register', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to the party' })).toBeVisible();

  await page.getByPlaceholder('Full name').fill('Nora Diaz');
  await page.getByPlaceholder('Email address').fill('n@jwt.com');
  await page.getByPlaceholder('Password').fill('secret');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'ND' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: "The web's best pizza" })).toBeVisible();
});

test('registered user can log in again', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Full name').fill('Nora Diaz');
  await page.getByPlaceholder('Email address').fill('n@jwt.com');
  await page.getByPlaceholder('Password').fill('secret');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'ND' })).toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'ND' })).toHaveCount(0);
  await login(page, 'n@jwt.com', 'secret');

  await expect(page.getByRole('link', { name: 'ND' })).toBeVisible();
});

test('register with an existing email shows an error', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();

  await page.getByPlaceholder('Full name').fill('Kai Chen');
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('main')).toContainText('{"code":409,"message":"User already exists"}');
  await expect(page.getByRole('heading', { name: 'Welcome to the party' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'KC' })).toHaveCount(0);
});

test('register requires every field', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();

  await page.getByPlaceholder('Full name').fill('Nora Diaz');
  await page.getByPlaceholder('Password').fill('secret');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('heading', { name: 'Welcome to the party' })).toBeVisible();
  await expect(page.getByLabel('Global').getByRole('link', { name: 'Register' })).toBeVisible();
});

test('register page links to login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();

  await page.getByRole('main').getByText('Login', { exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
