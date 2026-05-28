import { Router } from 'express'
import { getDb } from '../db/schema'

const router = Router()

// サマリー: 全期間の累計
router.get('/summary', (_req, res) => {
  const db = getDb()
  const row = db.prepare(`
    SELECT
      COUNT(*) as articles_count,
      COALESCE(SUM(likes_count), 0) as total_likes,
      COALESCE(SUM(stocks_count), 0) as total_stocks,
      COALESCE(SUM(page_views_count), 0) as total_pv
    FROM articles
  `).get() as { articles_count: number; total_likes: number; total_stocks: number; total_pv: number }

  res.json(row)
})

// 月次推移: アクティビティ日フィルター対応
// from: YYYY-MM, to: YYYY-MM
router.get('/trend', (req, res) => {
  const db = getDb()
  const from = (req.query.from as string) || ''
  const to = (req.query.to as string) || ''
  const fromDate = from ? `${from}-01` : '2000-01-01'
  const toDate = to ? `${to}-31` : '2099-12-31'

  const rows = db.prepare(`
    SELECT
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as count
    FROM like_events
    WHERE created_at BETWEEN ? AND ?
    GROUP BY month
    ORDER BY month
  `).all(fromDate, toDate) as Array<{ month: string; count: number }>

  res.json(rows)
})

// PV累計推移: スナップショットから全記事合計の累計
router.get('/pv-trend', (_req, res) => {
  const db = getDb()

  const snapshotCount = (db.prepare('SELECT COUNT(DISTINCT snapshot_date) as cnt FROM pv_snapshots').get() as { cnt: number }).cnt
  if (snapshotCount < 2) {
    return res.json({ status: 'insufficient_data', data: [] })
  }

  const rows = db.prepare(`
    SELECT snapshot_date as date, SUM(pv_count) as total_pv
    FROM pv_snapshots
    GROUP BY snapshot_date
    ORDER BY snapshot_date
  `).all() as Array<{ date: string; total_pv: number }>

  res.json({ status: 'ok', data: rows })
})

// 投稿頻度ヒートマップ用: 日付ごとの投稿数
router.get('/heatmap', (_req, res) => {
  const db = getDb()
  const rows = db.prepare(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count
    FROM articles
    GROUP BY DATE(created_at)
    ORDER BY date
  `).all() as Array<{ date: string; count: number }>

  res.json(rows)
})

export default router
