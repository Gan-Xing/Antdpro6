import { expect, test } from '@playwright/test';
import {
  expectDashboardReady,
  expireAccessToken,
  getStoredAccessToken,
  loginAsAdmin,
  logout,
} from './helpers/auth';

test.describe('auth session', () => {
  test('login -> dashboard -> refresh page -> logout', async ({ page }) => {
    await loginAsAdmin(page);

    await page.reload();
    await expectDashboardReady(page);

    await logout(page);
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
});
