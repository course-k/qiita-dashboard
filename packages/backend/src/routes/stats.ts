import { Router } from 'express'
import { getDb } from '../db/schema'

const router = Router()

interface HeatmapDay {
  date: string
  count: number
}

interface HeatmapWeek {
  weekStart: string
  weekEnd: string
  count: number
  days: HeatmapDay[]
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function getMonday(date: Date): Date {
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(date, diff)
}

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

// 投稿頻度ヒートマップ用: 月曜始まりの週別投稿数と日別内訳
router.get('/heatmap', (_req, res) => {
  const db = getDb()
  const rows = db.prepare('SELECT created_at FROM articles').all() as Array<{ created_at: string }>
  const currentWeekStart = getMonday(parseDate(formatDate(new Date())))
  const firstWeekStart = addDays(currentWeekStart, -52 * 7)
  const weeks = new Map<string, HeatmapWeek>()

  for (let i = 0; i <= 52; i += 1) {
    const weekStartDate = addDays(firstWeekStart, i * 7)
    const weekStart = formatDate(weekStartDate)
    weeks.set(weekStart, {
      weekStart,
      weekEnd: formatDate(addDays(weekStartDate, 6)),
      count: 0,
      days: Array.from({ length: 7 }, (_, dayIndex) => ({
        date: formatDate(addDays(weekStartDate, dayIndex)),
        count: 0,
      })),
    })
  }

  for (const row of rows) {
    const date = row.created_at.slice(0, 10)
    const weekStart = formatDate(getMonday(parseDate(date)))
    const week = weeks.get(weekStart)
    if (!week) continue

    const day = week.days.find(item => item.date === date)
    if (!day) continue

    day.count += 1
    week.count += 1
  }

  res.json({ weeks: Array.from(weeks.values()) })
})

export default router
