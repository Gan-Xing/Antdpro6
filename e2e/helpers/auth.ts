import { expect, type Page } from '@playwright/test';
import { getAdminUser } from '../fixtures/users';

const accessTokenKey = 'ACCESS_TOKEN';
const legacyRefreshTokenKey = 'REFRESH_TOKEN';
const refreshCookieName = 'nestweb_refresh_token';
const tokenTtlMs = 60 * 60 * 1000;

type WrappedResponse<T> = {
  statusCode: number;
  timestamp: string;
  message: string;
  data: T;
  success: boolean;
  showType: number;
};

function wrapResponse<T>(data: T): WrappedResponse<T> {
  return {
    statusCode: 200,
    timestamp: new Date().toISOString(),
    message: 'Operation successful',
    data,
    success: true,
    showType: 0,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function expectDashboardReady(page: Page) {
  await expect(page).toHaveURL(/\/dashboard(?:[/?#]|$)/);
  await expect(page.getByText(/集中查看系统状态、关键资源和常用管理入口/)).toBeVisible();
  await expect(page.getByText(/服务状态/)).toBeVisible();
  await expect(page.getByText(/权限管理|Authorization Management/i)).toBeVisible();
}

export async function loginAsAdmin(page: Page) {
  const admin = getAdminUser();

  await page.goto('/user/login');
  await expect(page).toHaveTitle(/企业管理平台|Enterprise Admin/);
  await expect(page.getByText(/企业管理平台|Enterprise Admin/).first()).toBeVisible();

  await page.getByPlaceholder(/邮箱|Email/i).fill(admin.email);
  await page.getByPlaceholder(/密码|Password/i).fill(admin.password);
  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: /登\s*录|Login/i }).click();
  const response = await loginResponse;
  expect(response.status()).toBeLessThan(300);

  await page.waitForURL(/\/dashboard(?:[/?#]|$)/);
  await expectDashboardReady(page);
}

export async function attemptInvalidLogin(page: Page) {
  const admin = getAdminUser();

  await page.goto('/user/login');
  await page.getByPlaceholder(/邮箱|Email/i).fill(admin.email);
  await page.getByPlaceholder(/密码|Password/i).fill(`${admin.password}-invalid`);
  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: /登\s*录|Login/i }).click();
  const response = await loginResponse;

  expect(response.status()).toBeGreaterThanOrEqual(400);
  await expect(page).toHaveURL(/\/user\/login(?:[/?#]|$)/);
  await expect(page.getByRole('button', { name: /登\s*录|Login/i })).toBeVisible();
}

export async function logout(page: Page) {
  await page.locator('.ant-pro-global-header-header-actions-avatar').click();
  await page.getByRole('menuitem', { name: /退出登录|Logout/i }).click();
  await expect(page).toHaveURL(/\/user\/login(?:[/?#]|$)/);
}

function base64Url(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function buildJwt(payload: Record<string, unknown>) {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.e2e`;
}

export async function expireAccessToken(page: Page) {
  const expiredJwt = buildJwt({ exp: 1, sub: 'e2e-expired-token' });

  await page.evaluate(
    ({ key, value }) => {
      const current = window.localStorage.getItem(key);
      const parsed = current ? JSON.parse(current) : {};
      window.localStorage.setItem(
        key,
        JSON.stringify({
          ...parsed,
          value,
          expiresAt: Date.now() + 60_000,
        }),
      );
    },
    { key: accessTokenKey, value: expiredJwt },
  );

  return expiredJwt;
}

export async function getStoredAccessToken(page: Page) {
  return page.evaluate((key) => {
    const current = window.localStorage.getItem(key);
    if (!current) {
      return undefined;
    }

    const parsed = JSON.parse(current);
    return parsed?.value as string | undefined;
  }, accessTokenKey);
}

export async function getLegacyStoredRefreshToken(page: Page) {
  return page.evaluate((key) => window.localStorage.getItem(key), legacyRefreshTokenKey);
}

export async function getRefreshCookie(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find((cookie) => cookie.name === refreshCookieName);
}

export async function expectProtectedPageRedirectsToLogin(page: Page, path = '/system/status') {
  await page.goto(path);
  await expect(page).toHaveURL(/\/user\/login\?redirect=/);
}

export async function expectProtectedPageLoads(page: Page, path: string, visibleText: RegExp) {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(path)}(?:[/?#]|$)`));
  await expect(page.getByText(visibleText).first()).toBeVisible();
}

export async function seedRestrictedUserSession(page: Page) {
  const accessToken = buildJwt({
    exp: Math.floor((Date.now() + tokenTtlMs) / 1000),
    sub: 'e2e-restricted-user',
  });

  await page.addInitScript(
    ({ key, token, ttl }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          value: token,
          expiresAt: Date.now() + ttl,
        }),
      );
    },
    { key: accessTokenKey, token: accessToken, ttl: tokenTtlMs },
  );

  await page.route('**/api/users/current', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        wrapResponse({
          id: 9001,
          username: 'limited-user',
          email: 'limited-user@example.com',
          isAdmin: false,
          roles: [
            {
              id: 9001,
              code: 'user',
              name: '普通用户',
              permissions: [{ id: 1, code: 'dashboard.view', name: '查看工作台' }],
            },
          ],
        }),
      ),
    });
  });

  await page.route('**/api/menus/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        wrapResponse([
          {
            id: 1,
            code: 'dashboard',
            name: '工作台',
            path: '/dashboard',
            icon: 'DashboardOutlined',
            children: [],
          },
        ]),
      ),
    });
  });

  await page.route('**/api/dashboard/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        wrapResponse({
          health: { status: 'ok', service: 'NestWeb API' },
          metrics: {},
          recentLogs: [],
        }),
      ),
    });
  });
}
