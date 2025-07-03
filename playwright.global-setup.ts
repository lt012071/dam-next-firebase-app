import { chromium, FullConfig } from '@playwright/test';

// CI環境でなければ.env.localを読み込む（ローカル開発用）
if (!process.env.CI) {
  const { config } = require('dotenv');
  config({ path: '.env.local' });
}

async function globalSetup(config: FullConfig) {
  // 主要な環境変数の有無をログ出力（最初に出力することで、テスト失敗時も必ず確認できるようにする）
  console.log('E2E_TEST_EMAIL:', process.env.E2E_TEST_EMAIL ? '[set]' : '[not set]');
  console.log('E2E_TEST_PASSWORD:', process.env.E2E_TEST_PASSWORD ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '[set]' : '[not set]');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '[set]' : '[not set]');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '[set]' : '[not set]');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '[set]' : '[not set]');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '[set]' : '[not set]');
  console.log('NEXT_PUBLIC_ALLOWED_EMAIL:', process.env.NEXT_PUBLIC_ALLOWED_EMAIL ? '[set]' : '[not set]');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error));
  await page.goto('http://localhost:3000/login-test');
  console.log(await page.content());
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