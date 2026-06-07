import { expect, type Page } from '@playwright/test';
import { getAdminUser } from '../fixtures/users';

const accessTokenKey = 'ACCESS_TOKEN';

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
  await page.getByRole('button', { name: /登录|Login/i }).click();

  await page.waitForURL(/\/dashboard(?:[/?#]|$)/);
  await expectDashboardReady(page);
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
