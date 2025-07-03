import { chromium, FullConfig } from '@playwright/test';

// CI環境でなければ.env.localを読み込む（ローカル開発用）
if (!process.env.CI) {
  const { config } = require('dotenv');
  config({ path: '.env.local' });
}

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login-test');
  await page.waitForSelector('input[aria-label="メールアドレス"]', { timeout: 60000 });
  await page.getByLabel('メールアドレス').fill(process.env.E2E_TEST_EMAIL!);
  await page.getByLabel('パスワード').fill(process.env.E2E_TEST_PASSWORD!);
  await Promise.all([
    page.waitForURL('http://localhost:3000/'),
    page.locator('button[type="submit"]').click(),
  ]);
  await page.context().storageState({ path: 'auth.json' });
  await browser.close();
}
export default globalSetup; 