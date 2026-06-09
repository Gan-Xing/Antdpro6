import { expect, test, type Page } from '@playwright/test';
import { getStoredAccessToken, loginAsAdmin } from './helpers/auth';

type CurrentUser = {
  id: number;
  username?: string | null;
  email?: string | null;
};

async function fetchCurrentUser(page: Page): Promise<CurrentUser> {
  const token = await getStoredAccessToken(page);
  expect(token).toBeTruthy();

  const response = await page.evaluate(async (accessToken) => {
    const result = await fetch('/api/users/current', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return result.json();
  }, token);

  expect(response?.success).toBeTruthy();
  return response.data as CurrentUser;
}

function modalFormItem(page: Page, label: string) {
  return page.locator('.ant-modal .ant-form-item').filter({ hasText: label }).last();
}

async function fillModalField(page: Page, label: string, value: string) {
  const formItem = modalFormItem(page, label);
  await expect(formItem).toBeVisible();
  await formItem.locator('input, textarea').first().fill(value);
}

async function selectModalOption(page: Page, label: string, searchText: string) {
  const formItem = modalFormItem(page, label);
  await expect(formItem).toBeVisible();
  await formItem.locator('.ant-select-selector').click();

  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown).toBeVisible();

  const searchInput = dropdown.locator('input').first();
  if (await searchInput.count()) {
    await searchInput.fill(searchText);
  }

  const matchingOption = dropdown
    .locator('.ant-select-item-option')
    .filter({ hasText: searchText })
    .first();
  if (await matchingOption.count()) {
    await matchingOption.click();
    return;
  }

  await dropdown.locator('.ant-select-item-option').first().click();
}

async function exportCurrentPage(page: Page, expectedFilename: RegExp) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /导出当前页/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(expectedFilename);
}

test.describe('S8 message and approval acceptance', () => {
  test('creates and approves an approval request with message and CSV export coverage', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const currentUser = await fetchCurrentUser(page);
    const approverLabel = currentUser.username || currentUser.email || String(currentUser.id);
    const unique = Date.now();
    const title = `E2E 审批 ${unique}`;
    const businessId = `e2e-${unique}`;

    await page.goto('/approvals/requests');
    await expect(page.getByText(/审批请求/).first()).toBeVisible();

    await page.getByRole('button', { name: /新建审批/ }).click();
    await expect(page.getByRole('dialog', { name: /新建审批请求/ })).toBeVisible();

    await fillModalField(page, '标题', title);
    await fillModalField(page, '业务类型', 'e2e_approval');
    await fillModalField(page, '业务 ID', businessId);
    await selectModalOption(page, '审批用户', approverLabel);
    await fillModalField(page, '说明', 'S8 Playwright approval acceptance');

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/approval-requests') &&
        response.request().method() === 'POST' &&
        !response.url().includes('/approve') &&
        response.status() < 300,
    );
    await page
      .locator('.ant-modal .ant-btn-primary')
      .filter({ hasText: /OK|Submit|Confirm|确\s*定|提交/ })
      .click();
    await createResponse;
    await expect(page.getByText(/审批请求已提交/)).toBeVisible();
    await expect(
      page.locator('.ant-table-tbody tr').filter({ hasText: title }).first(),
    ).toBeVisible();

    await page.goto('/message-center');
    await expect(page.getByText(/消息中心/).first()).toBeVisible();
    const messageRow = page
      .locator('.ant-table-tbody tr')
      .filter({ hasText: `待审批：${title}` })
      .first();
    await expect(messageRow).toBeVisible();
    await exportCurrentPage(page, /^messages-todos\.csv$/);

    await page.goto('/approvals/requests');
    const approvalRow = page.locator('.ant-table-tbody tr').filter({ hasText: title }).first();
    await expect(approvalRow).toBeVisible();

    await approvalRow.getByText('通过').click();
    const confirm = page.locator('.ant-modal-confirm').last();
    await expect(confirm).toBeVisible();
    await confirm.locator('textarea').fill('S8 E2E approved');

    const approveResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/approval-requests/') &&
        response.url().includes('/approve') &&
        response.request().method() === 'POST' &&
        response.status() < 300,
    );
    await confirm.locator('.ant-btn-primary').click();
    await approveResponse;
    await expect(page.getByText(/操作成功/)).toBeVisible();
    await expect(approvalRow.getByText('已通过')).toBeVisible();
    await exportCurrentPage(page, /^approval-requests-all\.csv$/);
  });
});
