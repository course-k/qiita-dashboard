import { getDb } from '../db/schema'
import { fetchAllItems, fetchLikes } from './qiita'

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getSyncState(key: string): string | null {
  const db = getDb()
  const row = db.prepare('SELECT value FROM sync_state WHERE key = ?').get(key) as { value: string } | undefined
  return row ? row.value : null
}

function setSyncState(key: string, value: string): void {
  getDb().prepare('INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)').run(key, value)
}

let isSyncing = false

export function getSyncStatus(): { syncing: boolean; lastSyncedAt: string | null } {
  return {
    syncing: isSyncing,
    lastSyncedAt: getSyncState('last_synced_at'),
  }
}

export async function runSync(full = false): Promise<void> {
  if (isSyncing) {
    console.log('Sync already in progress, skipping')
    return
  }

  isSyncing = true
  const isFirstSync = getSyncState('last_synced_at') === null
  const mode = full || isFirstSync ? 'full' : 'incremental'
  console.log(`Starting ${mode} sync...`)

  try {
    const db = getDb()
    const now = new Date().toISOString()
    const today = toDateString(new Date())

    // 1. 記事一覧取得・upsert
    const items = await fetchAllItems()
    const upsertItem = db.prepare(`
      INSERT OR REPLACE INTO articles
        (id, title, url, tags, created_at, updated_at, likes_count, stocks_count, page_views_count, comments_count, last_synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    db.exec('BEGIN')
    try {
      for (const item of items) {
        upsertItem.run(
          item.id, item.title, item.url,
          JSON.stringify(item.tags.map(t => t.name)),
          item.created_at, item.updated_at,
          item.likes_count, item.stocks_count,
          item.page_views_count ?? null,
          item.comments_count, now,
        )
      }
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
    console.log(`Upserted ${items.length} articles`)

    // 2. PVスナップショット保存
    const upsertPv = db.prepare(`
      INSERT OR IGNORE INTO pv_snapshots (article_id, snapshot_date, pv_count, captured_at)
      VALUES (?, ?, ?, ?)
    `)
    db.exec('BEGIN')
    try {
      for (const item of items) {
        if (item.page_views_count !== null) {
          upsertPv.run(item.id, today, item.page_views_count, now)
        }
      }
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }

    // 3. いいねイベント同期（ストックはAPI上で日時が取得できないため対象外）
    for (const item of items) {
      await syncLikes(item.id, mode)
    }

    setSyncState('last_synced_at', now)
    console.log('Sync completed')
  } finally {
    isSyncing = false
  }
}

async function syncLikes(articleId: string, mode: string): Promise<void> {
  const db = getDb()
  const upsert = db.prepare(`
    INSERT OR IGNORE INTO like_events (article_id, user_id, created_at)
    VALUES (?, ?, ?)
  `)
  const likes = await fetchLikes(articleId)

  if (mode === 'incremental') {
    const exists = db.prepare('SELECT 1 FROM like_events WHERE article_id = ? AND user_id = ?')
    for (const like of likes) {
      if (exists.get(articleId, like.user.id)) break
      upsert.run(articleId, like.user.id, like.created_at)
    }
  } else {
    db.exec('BEGIN')
    try {
      for (const like of likes) {
        upsert.run(articleId, like.user.id, like.created_at)
      }
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  }
}
