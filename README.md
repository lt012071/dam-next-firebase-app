# Next.js + Firebase デジタルアセット管理アプリ

このアプリは、Next.jsとFirebaseを用いたデジタルアセット管理（DAM: Digital Asset Management）システムです。  
画像・動画・PDFなどのファイルをアップロード・管理・バージョン管理できます。Google認証によるログイン機能も備えています。

## 主な機能

- Googleアカウントによる認証（管理者メールアドレスのみ許可）
- アセット（画像・動画・PDF等）のアップロード・メタデータ登録
- アセットの一覧・検索・フィルタリング
- アセットのバージョン管理・履歴表示・復元
- 最近アップロードされたアセットやストレージ使用量のダッシュボード表示

## ディレクトリ構成

```
src/
  pages/           ... Next.js ページ
    index.tsx      ... トップページ
    login.tsx      ... ログインページ
    upload.tsx     ... アセットアップロード
    assets.tsx     ... アセット一覧・検索
    assets/[id].tsx ... アセット詳細ページ
    version-history.tsx ... バージョン履歴
    dashboard.tsx  ... ダッシュボード
  components/      ... UIコンポーネント
  lib/             ... Firebase/リポジトリ層
  types/           ... 型定義
  styles/          ... CSSモジュール
firebase.ts        ... Firebase初期化
```

## セットアップ

1. **リポジトリをクローン**

```bash
git clone <このリポジトリのURL>
cd next-firebase-app
```

2. **依存パッケージのインストール**

```bash
npm install
```

3. **環境変数の設定**

`.env.local` ファイルを作成し、以下を設定してください。

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_SECRET=xxx
ALLOWED_EMAIL=your-admin@example.com
```

4. **開発サーバーの起動**

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて動作を確認できます。

## 主要ページの説明

- `/login`  
  Googleアカウントでログインします。管理者メールアドレスのみアクセス可能です。

- `/dashboard`  
  最近アップロードされたアセットやストレージ使用量を確認できます。

- `/upload`  
  ファイルをアップロードし、タイトル・説明・カテゴリ・タグ・公開範囲を設定できます。

- `/assets`  
  アセットの一覧表示・検索・フィルタリングが可能です。各アセットをクリックすると詳細・バージョン履歴へ遷移します。

- `/assets/[id]`  
  アセットの詳細情報・編集・削除・バージョン差し替えが可能です。

- `/version-history?assetId=xxx`  
  アセットのバージョン履歴を表示し、過去バージョンのプレビューや復元ができます。

## APIエンドポイント

- `GET /api/asset-versions?assetId=xxx`  
  指定アセットのバージョン数を返します。

- `GET /api/hello`  
  サンプルAPI（`{ name: "John Doe" }` を返す）

- `POST/GET /api/auth/[...nextauth]`  
  NextAuth.jsによるGoogle認証API

## 技術スタック

- Next.js 15
- React 19
- TypeScript
- Firebase（Firestore, Storage, Auth）
- next-auth（Google認証）

## 補足

- 画像の最適化のため、`next.config.ts`でGoogleユーザーアイコンのドメインを許可しています。
- フォントはVercelのGeistを利用しています。

---

ご不明点・機能追加要望などはIssueまたはPull Requestでご連絡ください。
