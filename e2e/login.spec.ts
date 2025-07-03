import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: undefined });

test('ログインページでGoogle認証ボタンが表示されていること', async ({ page }: { page: Page }) => {
  await page.goto('/login');
  // Google認証ボタンのテキストやdata-testidなど、実装に応じて調整してください
  const googleBtn = page.getByRole('button', { name: /google/i });
  await expect(googleBtn).toBeVisible();
  await expect(googleBtn).toBeEnabled();
});

test('タイトルが表示される', async ({ page }: { page: Page }) => {
  await page.goto('/login');
  await expect(page.getByText('Digital Asset Management')).toBeVisible();
});

test('Google認証ボタンのラベルが正しい', async ({ page }: { page: Page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /Googleでログイン/ })).toBeVisible();
});

test('Google認証ボタンがクリック可能', async ({ page }: { page: Page }) => {
  await page.goto('/login');
  const googleBtn = page.getByRole('button', { name: /Googleでログイン/ });
  await expect(googleBtn).toBeEnabled();
  await googleBtn.click(); // 実際の認証は発生しないが、クリックでエラーにならないことのみ確認
}); 