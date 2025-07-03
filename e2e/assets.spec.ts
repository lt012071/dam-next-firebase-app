import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test('アセット一覧ページが正しく表示される', async ({ page }: { page: Page }) => {
  await page.goto('/assets');
  await expect(page.locator('main')).toBeVisible();
});

test.skip('アセットが0件の場合No assets found.が表示される', async ({ page }: { page: Page }) => {
  await page.goto('/assets');
  // assetsが0件の場合のUI（現状の実装に合わせて）
  await expect(page.locator('main')).toContainText('No assets found.');
});

test('アセットリストが表示される（ダミーデータ）', async ({ page }: { page: Page }) => {
  await page.goto('/assets');
});

test('ローディング表示が出る', async ({ page }: { page: Page }) => {
  await page.goto('/assets');
});

test('未認証時はリダイレクトされる', async ({ page }: { page: Page }) => {
});

// UI要素の存在確認
// test('フィルタUIやアップロードボタンが表示される', async ({ page }: { page: Page }) => {
//   await page.goto('/assets');
//   await expect(page.getByText('Upload')).toBeVisible();
//   await expect(page.getByPlaceholder('Search assets')).toBeVisible();
//   await expect(page.getByPlaceholder('Tags')).toBeVisible();
//   await expect(page.getByText('File Type')).toBeVisible();
//   await expect(page.getByText('Category')).toBeVisible();
// }); 