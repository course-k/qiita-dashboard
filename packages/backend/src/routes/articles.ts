import { Router } from 'express'
import { getDb } from '../db/schema'

const router = Router()

type SortColumn = 'created_at' | 'likes_count' | 'stocks_count' | 'page_views_count' | 'likes_rate' | 'stocks_rate'

function toFromDate(value: string): string {
  return value.length === 7 ? `${value}-01` : value
}

function toToDate(value: string): string {
  return value.length === 7 ? `${value}-31T23:59:59` : `${value}T23:59:59`
}

// 記事一覧: 投稿日フィルター・ソート対応
router.get('/', (req, res) => {
  const db = getDb()
  const from = (req.query.from as string) || ''
  const to = (req.query.to as string) || ''
  const sort = ((req.query.sort as string) || 'created_at') as SortColumn
  const order = (req.query.order as string) === 'asc' ? 'ASC' : 'DESC'

  const validSorts: SortColumn[] = ['created_at', 'likes_count', 'stocks_count', 'page_views_count', 'likes_rate', 'stocks_rate']
  if (!validSorts.includes(sort)) {
    return res.status(400).json({ error: 'Invalid sort column' })
  }

  let orderExpr: string
  if (sort === 'likes_rate') {
    orderExpr = `CASE WHEN COALESCE(page_views_count, 0) = 0 THEN 0 ELSE CAST(likes_count AS REAL) / page_views_count END ${order}`
  } else if (sort === 'stocks_rate') {
    orderExpr = `CASE WHEN COALESCE(page_views_count, 0) = 0 THEN 0 ELSE CAST(stocks_count AS REAL) / page_views_count END ${order}`
  } else {
    orderExpr = `${sort} ${order}`
  }

  const conditions: string[] = []
  const params: string[] = []
  if (from) { conditions.push('created_at >= ?'); params.push(toFromDate(from)) }
  if (to) { conditions.push('created_at <= ?'); params.push(toToDate(to)) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const rows = db.prepare(`
    SELECT
      id, title, url, tags, created_at, likes_count, stocks_count,
      COALESCE(page_views_count, 0) as page_views_count, comments_count,
      CASE WHEN COALESCE(page_views_count, 0) = 0 THEN NULL
           ELSE ROUND(CAST(likes_count AS REAL) / page_views_count * 100, 2) END as likes_rate,
      CASE WHEN COALESCE(page_views_count, 0) = 0 THEN NULL
           ELSE ROUND(CAST(stocks_count AS REAL) / page_views_count * 100, 2) END as stocks_rate
    FROM articles
    ${where}
    ORDER BY ${orderExpr}
  `).all(...params) as Record<string, unknown>[]

  const result = rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags as string),
  }))

  res.json(result)
})

// ランキング: 指定指標上位N件
router.get('/ranking', (req, res) => {
  const db = getDb()
  const metric = (req.query.metric as string) || 'likes_count'
  const limit = Math.min(parseInt((req.query.limit as string) || '5', 10), 20)

  const validMetrics = ['likes_count', 'stocks_count', 'page_views_count', 'likes_rate', 'stocks_rate']
  if (!validMetrics.includes(metric)) {
    return res.status(400).json({ error: 'Invalid metric' })
  }

  let orderExpr: string
  if (metric === 'likes_rate') {
    orderExpr = 'CASE WHEN COALESCE(page_views_count, 0) = 0 THEN 0 ELSE CAST(likes_count AS REAL) / page_views_count END DESC'
  } else if (metric === 'stocks_rate') {
    orderExpr = 'CASE WHEN COALESCE(page_views_count, 0) = 0 THEN 0 ELSE CAST(stocks_count AS REAL) / page_views_count END DESC'
  } else {
    orderExpr = `${metric} DESC`
  }

  const rows = db.prepare(`
    SELECT
      id, title, url, likes_count, stocks_count,
      COALESCE(page_views_count, 0) as page_views_count,
      CASE WHEN COALESCE(page_views_count, 0) = 0 THEN NULL
           ELSE ROUND(CAST(likes_count AS REAL) / page_views_count * 100, 2) END as likes_rate,
      CASE WHEN COALESCE(page_views_count, 0) = 0 THEN NULL
           ELSE ROUND(CAST(stocks_count AS REAL) / page_views_count * 100, 2) END as stocks_rate
    FROM articles
    ORDER BY ${orderExpr}
    LIMIT ?
  `).all(limit) as Record<string, unknown>[]

  res.json(rows)
})

export default router
