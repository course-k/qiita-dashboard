# AGENTS.md

## Project Overview

Qiita Dashboard is a local-only web app for syncing Qiita article statistics into SQLite and visualizing articles, likes, stocks, PV snapshots, and posting activity.

The repository is an npm workspaces monorepo:

- `packages/frontend`: Vite + React + TypeScript + Tailwind CSS.
- `packages/backend`: Express + TypeScript + `node:sqlite`.
- SQLite data is stored under `packages/backend/data`.

## Setup and Commands

- Install dependencies: `npm install`
- Run frontend and backend in development: `npm run dev`
- Build everything: `npm run build`
- Build backend only: `npm run build --workspace packages/backend`
- Build frontend only: `npm run build --workspace packages/frontend`
- Run with Docker: `docker compose up -d --build`

There is no dedicated test script at the moment. After code changes, run the narrowest relevant build command, and run `npm run build` for cross-package changes.

## Environment and Data

- Backend configuration lives in `packages/backend/.env`.
- `QIITA_ACCESS_TOKEN` is required for Qiita API access.
- Do not commit `.env`, SQLite databases, or files under `packages/backend/data`.
- Treat `packages/backend/data/qiita.db` as local user data. Do not delete, reset, or rewrite it unless the user explicitly asks.

## Backend Guidelines

- Keep API routes in `packages/backend/src/routes`.
- Keep Qiita API access in `packages/backend/src/services/qiita.ts`.
- Keep sync behavior in `packages/backend/src/services/sync.ts`.
- Keep schema creation and small migrations in `packages/backend/src/db/schema.ts`.
- Preserve existing SQLite compatibility. When adding columns, use idempotent migrations so existing local databases continue to start.
- PV snapshots use `snapshot_date` for daily grouping and `captured_at` for the actual acquisition time.
- Scheduled sync uses `node-cron` in `packages/backend/src/cron/scheduler.ts` and runs daily at 09:00 JST while the app process is active.

## Frontend Guidelines

- Keep page-level components in `packages/frontend/src/pages`.
- Keep reusable UI components in `packages/frontend/src/components`.
- Keep API calls in `packages/frontend/src/api/client.ts`.
- Keep shared TypeScript types in `packages/frontend/src/types`.
- Match the existing dashboard style: compact, data-focused, and readable. Avoid marketing-style layouts for operational screens.

## Change Workflow

- Read the relevant files before making claims about behavior.
- Keep changes scoped to the requested behavior.
- Prefer existing project patterns over new abstractions.
- Do not add production dependencies without a clear need and user approval.
- For troubleshooting, inspect logs, DB state, and source code before proposing a cause.
- For Docker runtime issues, check `docker compose ps` and `docker compose logs app`.

## Verification

- Backend-only changes: run `npm run build --workspace packages/backend`.
- Frontend-only changes: run `npm run build --workspace packages/frontend`.
- Cross-package changes: run `npm run build`.
- Docker/runtime changes: run `docker compose up -d --build` and confirm `docker compose ps`.
