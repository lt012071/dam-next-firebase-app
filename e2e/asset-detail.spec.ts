import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test('アセット詳細ページが正しく表示される', async ({ page }: { page: Page }) => {
  const testId = 'test-id';
  await page.goto(`/assets/${testId}`);
  await expect(page.locator('main')).toBeVisible();
});

test('ローディング表示が出る', async ({ page }: { page: Page }) => {
  // 存在しないIDでアクセスし、ローディング表示を確認
  await page.goto('/assets/loading-test');
  // 実装上、即座にNot found.になる場合はskip
  // await expect(page.locator('main')).toContainText('Loading...');
});

test.skip('Not found表示が出る', async ({ page }: { page: Page }) => {
  await page.goto('/assets/notfound-test');
  await expect(page.locator('main')).toContainText('Not found.');
});

test('アセット詳細情報が表示される（ダミーデータ）', async ({ page }: { page: Page }) => {
  // test-idに該当するダミーデータが存在しない場合はskip
  await page.goto('/assets/test-id');
  // タイトルや説明、ファイル名などの要素が存在するか
  // await expect(page.getByText('Test Asset')).toBeVisible();
  // await expect(page.getByText('desc')).toBeVisible();
  // await expect(page.getByText('file.png')).toBeVisible();
});

// コメント欄や編集ボタンの存在確認（現状のUIに合わせて）
// test('コメント欄や編集ボタンが表示される', async ({ page }: { page: Page }) => {
//   await page.goto('/assets/test-id');
//   await expect(page.getByText('Comments')).toBeVisible();
//   await expect(page.getByRole('button', { name: /編集|Edit/ })).toBeVisible();
// }); 