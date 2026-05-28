# Qiita統計ダッシュボード

Qiitaの投稿データをローカルSQLiteに同期し、記事数・いいね・ストック・PV・投稿頻度を確認するローカル専用Webアプリです。

## 主な機能

- Qiitaプロフィールとサマリー指標の表示
- 月次いいね推移、PV累計推移、投稿頻度ヒートマップの可視化
- 記事一覧の投稿日フィルター、ソート、ランキング表示
- Qiita APIからの記事・いいね・PVスナップショット同期
- 毎日9:00 JSTの自動同期

## 構成

- npm workspaces
- フロントエンド: Vite + React + TypeScript
- バックエンド: Express + TypeScript + node:sqlite
- データベース: SQLite

## 必要なもの

- Node.js 24以上
- npm
- Qiitaアクセストークン

## セットアップ

```bash
npm install
cp .env.example packages/backend/.env
```

`packages/backend/.env` にQiitaアクセストークンを設定します。

```env
QIITA_ACCESS_TOKEN=your_qiita_access_token_here
```

## 開発環境で起動

```bash
npm run dev
```

フロントエンドは `http://localhost:5173`、バックエンドAPIは `http://localhost:3001` で起動します。

## ビルド

```bash
npm run build
```

## Dockerで起動

```bash
docker compose up -d --build
```

SQLiteデータは `packages/backend/data` に保存されます。

## 注意事項

このアプリはローカル利用を前提としています。Qiitaアクセストークンを含む `.env` やSQLiteデータベースは公開リポジトリにコミットしないでください。
