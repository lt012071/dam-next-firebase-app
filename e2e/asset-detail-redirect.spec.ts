import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: undefined });

test('未認証時はアセット詳細ページにアクセスするとログインページにリダイレクトされる', async ({ page }: { page: Page }) => {
  const testId = 'test-id';
  await page.goto(`/assets/${testId}`);
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
}); 