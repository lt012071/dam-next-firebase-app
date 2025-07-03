import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: undefined });

test('未認証時はアセット一覧ページにアクセスするとログインページにリダイレクトされる', async ({ page }: { page: Page }) => {
  await page.goto('/assets');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
}); 