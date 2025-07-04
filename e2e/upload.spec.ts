import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test('アップロードページが正しく表示される', async ({ page }: { page: Page }) => {
  await page.goto('/upload');
  // ファイル選択inputやアップロードボタンの存在確認。実装に応じて調整してください
  await expect(page.locator('input[type="file"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
});

test('主要なUI要素が表示される', async ({ page }: { page: Page }) => {
  await page.goto('/upload');
  await expect(page.getByText('Upload Assets')).toBeVisible();
  await expect(page.getByText('Drag and drop files here')).toBeVisible();
  await expect(page.getByText('Or click to browse your files')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
});

test('Visibility切り替えラジオボタンが表示される', async ({ page }: { page: Page }) => {
  await page.goto('/upload');
  await expect(page.getByLabel('Public')).toBeVisible();
  await expect(page.getByLabel('Private')).toBeVisible();
});

// ファイル選択時のファイル名表示やバリデーションは、ダミーファイルがなければskip
// test('ファイル選択時にファイル名が表示される', async ({ page }: { page: Page }) => {
//   await page.goto('/upload');
//   // ファイル選択操作を自動化する場合はここでinput[type="file"]にセット
// });
// test('バリデーション: ファイル・タイトル・カテゴリが必須', async ({ page }: { page: Page }) => {
//   await page.goto('/upload');
//   await page.getByRole('button').click();
//   await expect(page.getByText('ファイル・タイトル・カテゴリは必須です')).toBeVisible();
// }); 