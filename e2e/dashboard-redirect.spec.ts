import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: undefined });

test('未認証時はダッシュボードにアクセスするとログインページにリダイレクトされる', async ({ page }: { page: Page }) => {
  await page.goto('/dashboard');
  // ログインページのURLや要素で判定。URLが/loginを含む、またはGoogle認証ボタンが見える、など
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
}); 