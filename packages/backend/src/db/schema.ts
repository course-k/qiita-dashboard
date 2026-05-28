import { DatabaseSync } from 'node:sqlite'
import path from 'path'

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/qiita.db')

let db: DatabaseSync

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH)
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
  }
  return db
}

export function initDb(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      likes_count INTEGER NOT NULL DEFAULT 0,
      stocks_count INTEGER NOT NULL DEFAULT 0,
      page_views_count INTEGER,
      comments_count INTEGER NOT NULL DEFAULT 0,
      last_synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS like_events (
      article_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (article_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS pv_snapshots (
      article_id TEXT NOT NULL,
      snapshot_date TEXT NOT NULL,
      pv_count INTEGER NOT NULL,
      PRIMARY KEY (article_id, snapshot_date)
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  console.log('Database initialized')
}
