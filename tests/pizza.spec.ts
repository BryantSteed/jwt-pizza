import { Page } from '@playwright/test';
import { test, expect } from './testSetup';
import { Franchise, Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'f@jwt.com': { id: '4', name: 'Pizza Franchisee', email: 'f@jwt.com', password: 'f', roles: [{ role: Role.Franchisee, objectId: '9' }] },
  };
  const franchiseeFranchise: Franchise = {
    id: '9',
    name: 'pizzaPocket',
    admins: [{ id: '4', name: 'Pizza Franchisee', email: 'f@jwt.com' }],
    stores: [
      { id: '11', name: 'Lehi', totalRevenue: 1500 },
      { id: '12', name: 'Springville', totalRevenue: 250 },
    ],
  };

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const userId = route.request().url().split('/').pop();
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: userId === '4' ? [franchiseeFranchise] : [] });
  });

  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    const [franchiseId] = route.request().url().split('/').slice(-2);
    const storeReq = route.request().postDataJSON();
    expect(route.request().method()).toBe('POST');
    expect(franchiseId).toBe(franchiseeFranchise.id);
    expect(storeReq).toEqual({ id: '', name: expect.any(String) });
    const storeRes = { id: '13', name: storeReq.name, totalRevenue: 0 };
    franchiseeFranchise.stores.push(storeRes);
    await route.fulfill({ json: storeRes });
  });

  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
    const [franchiseId, , storeId] = route.request().url().split('/').slice(-3);
    expect(route.request().method()).toBe('DELETE');
    expect(franchiseId).toBe(franchiseeFranchise.id);
    expect(franchiseeFranchise.stores.map((s) => s.id)).toContain(storeId);
    franchiseeFranchise.stores = franchiseeFranchise.stores.filter((s) => s.id !== storeId);
    await route.fulfill({ json: { message: 'store deleted' } });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

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

async function openFranchiseDashboard(page: Page) {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('f');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
}

test('franchisee sees their stores', async ({ page }) => {
  await openFranchiseDashboard(page);

  await expect(page.getByRole('row', { name: /Lehi/ })).toContainText('1,500 ₿');
  await expect(page.getByRole('row', { name: /Springville/ })).toContainText('250 ₿');
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
});

test('franchisee creates a store', async ({ page }) => {
  await openFranchiseDashboard(page);

  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading', { name: 'Create store' })).toBeVisible();
  await page.getByPlaceholder('store name').fill('Provo');
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Provo/ })).toContainText('0 ₿');
});

test('franchisee closes a store', async ({ page }) => {
  await openFranchiseDashboard(page);

  await page.getByRole('row', { name: /Lehi/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Sorry to see you go' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the pizzaPocket store Lehi ?');
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
  await expect(page.getByRole('row', { name: /Springville/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Lehi/ })).toHaveCount(0);
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('button', { name: 'Order now' }).click();

  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByText('0.008')).toBeVisible();
});