import { expect, test } from '@playwright/test';
import {
  attemptInvalidLogin,
  expectDashboardReady,
  expectProtectedPageLoads,
  expectProtectedPageRedirectsToLogin,
  expireAccessToken,
  getStoredAccessToken,
  loginAsAdmin,
  logout,
  seedRestrictedUserSession,
} from './helpers/auth';

test.describe('auth session', () => {
  test('login failure stays on login page', async ({ page }) => {
    await attemptInvalidLogin(page);
  });

  test('login success lands on dashboard', async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('refresh page keeps login session', async ({ page }) => {
    await loginAsAdmin(page);

    await page.reload();
    await expectDashboardReady(page);
  });

  test('logout returns to login page', async ({ page }) => {
    await loginAsAdmin(page);

    await logout(page);
  });

  test('protected page redirects to login after logout', async ({ page }) => {
    await loginAsAdmin(page);
    await logout(page);

    await expectProtectedPageRedirectsToLogin(page, '/system/status');
  });

  test('expired access token refreshes session', async ({ page }) => {
    await loginAsAdmin(page);

    const expiredToken = await expireAccessToken(page);
    const refreshResponse = page.waitForResponse((response) =>
      response.url().includes('/api/auth/refresh'),
    );

    await page.reload();
    await refreshResponse;
    await expectDashboardReady(page);

    await expect.poll(() => getStoredAccessToken(page)).not.toBe(expiredToken);
  });

  test('operations pages load for admin', async ({ page }) => {
    await loginAsAdmin(page);

    await expectProtectedPageLoads(page, '/dashboard', /集中查看系统状态、关键资源和常用管理入口/);
    await expectProtectedPageLoads(page, '/system/status', /整体状态|Database/i);
    await expectProtectedPageLoads(page, '/system/version', /版本信息/);
    await expectProtectedPageLoads(page, '/system/queues', /Waiting|队列/);
    await expectProtectedPageLoads(page, '/security/login-logs', /登录日志/);
  });

  test('restricted user cannot see or access unauthorized operations menu', async ({ page }) => {
    await seedRestrictedUserSession(page);

    await page.goto('/dashboard');
    await expect(page.getByText(/系统管理/)).toHaveCount(0);
    await expect(page.getByText(/安全中心/)).toHaveCount(0);

    await page.goto('/system/status');
    await expect(page.getByText('403')).toBeVisible();
    await expect(page.getByText(/没有访问该页面的权限/)).toBeVisible();
  });
});
