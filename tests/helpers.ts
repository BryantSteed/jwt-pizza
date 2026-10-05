import { Page } from '@playwright/test';
import { expect } from './testSetup';
import { Franchise, Role, User } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'f@jwt.com': { id: '4', name: 'Pizza Franchisee', email: 'f@jwt.com', password: 'f', roles: [{ role: Role.Franchisee, objectId: '9' }] },
    'a@jwt.com': { id: '1', name: 'Pizza Admin', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
  };
  let franchises: Franchise[] = [
    {
      id: '2',
      name: 'LotaPizza',
      admins: [{ id: '5', name: 'Lota Owner', email: 'l@jwt.com' }],
      stores: [
        { id: '4', name: 'Lehi', totalRevenue: 4200 },
        { id: '5', name: 'Springville', totalRevenue: 0 },
        { id: '6', name: 'American Fork', totalRevenue: 0 },
      ],
    },
    { id: '3', name: 'PizzaCorp', admins: [{ id: '6', name: 'Corp Owner', email: 'c@jwt.com' }], stores: [{ id: '7', name: 'Spanish Fork', totalRevenue: 75 }] },
    { id: '4', name: 'topSpot', admins: [{ id: '7', name: 'Top Owner', email: 't@jwt.com' }], stores: [] },
    {
      id: '9',
      name: 'pizzaPocket',
      admins: [{ id: '4', name: 'Pizza Franchisee', email: 'f@jwt.com' }],
      stores: [
        { id: '11', name: 'Lehi', totalRevenue: 1500 },
        { id: '12', name: 'Springville', totalRevenue: 250 },
      ],
    },
  ];

  await page.route('*/**/api/auth', async (route) => {
    // logout request
    if (route.request().method() === 'DELETE') {
      loggedInUser = undefined;
      await route.fulfill({ json: { message: 'logout successful' } });
      return;
    }
    // register request
    if (route.request().method() === 'POST') {
      const registerReq = route.request().postDataJSON();
      expect(registerReq).toEqual({ name: expect.any(String), email: expect.any(String), password: expect.any(String) });
      if (validUsers[registerReq.email]) {
        await route.fulfill({ status: 409, json: { message: 'User already exists' } });
        return;
      }
      validUsers[registerReq.email] = { id: '20', ...registerReq, roles: [{ role: Role.Diner }] };
      loggedInUser = validUsers[registerReq.email];
      const registerRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      await route.fulfill({ json: registerRes });
      return;
    }
    expect(route.request().method()).toBe('PUT');
    // This would be a login request because its PUT
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
    if (route.request().method() === 'POST') {
      const franchiseReq = route.request().postDataJSON();
      expect(franchiseReq).toEqual({ stores: [], id: '', name: expect.any(String), admins: [{ email: expect.any(String) }] });
      const franchiseRes = { ...franchiseReq, id: '10', admins: [{ id: '8', name: 'New Franchisee', email: franchiseReq.admins[0].email }] };
      franchises.push(franchiseRes);
      await route.fulfill({ json: franchiseRes });
      return;
    }
    const params = new URL(route.request().url()).searchParams;
    const start = Number(params.get('page') ?? 0) * Number(params.get('limit') ?? 10);
    const end = start + Number(params.get('limit') ?? 10);
    const nameFilter = (params.get('name') ?? '*').replace(/\*/g, '').toLowerCase();
    const matching = franchises.filter((f) => f.name.toLowerCase().includes(nameFilter));
    const franchiseRes = { franchises: matching.slice(start, end), more: matching.length > end };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const id = route.request().url().split('/').pop();
    if (route.request().method() === 'DELETE') {
      expect(franchises.map((f) => f.id)).toContain(id);
      franchises = franchises.filter((f) => f.id !== id);
      await route.fulfill({ json: { message: 'franchise deleted' } });
      return;
    }
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchises.filter((f) => f.admins?.some((a) => a.id === id)) });
  });

  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    const [franchiseId] = route.request().url().split('/').slice(-2);
    const franchise = franchises.find((f) => f.id === franchiseId);
    const storeReq = route.request().postDataJSON();
    expect(route.request().method()).toBe('POST');
    expect(franchise).toBeDefined();
    expect(storeReq).toEqual({ id: '', name: expect.any(String) });
    const storeRes = { id: '13', name: storeReq.name, totalRevenue: 0 };
    franchise!.stores.push(storeRes);
    await route.fulfill({ json: storeRes });
  });

  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
    const [franchiseId, , storeId] = route.request().url().split('/').slice(-3);
    const franchise = franchises.find((f) => f.id === franchiseId);
    expect(route.request().method()).toBe('DELETE');
    expect(franchise).toBeDefined();
    expect(franchise!.stores.map((s) => s.id)).toContain(storeId);
    franchise!.stores = franchise!.stores.filter((s) => s.id !== storeId);
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

export async function login(page: Page, email: string, password: string) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

export async function openFranchiseDashboard(page: Page) {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'f');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

  await expect(page.getByRole('heading', { name: 'pizzaPocket' })).toBeVisible();
}

export async function openAdminDashboard(page: Page) {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByLabel('Global').getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
}
