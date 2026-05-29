export interface Profile {
  id: string
  name: string
  description: string
  profile_image_url: string
  items_count: number
  followers_count: number
  followees_count: number
}

export interface Summary {
  articles_count: number
  total_likes: number
  total_stocks: number
  total_pv: number
}

export interface TrendPoint {
  month: string
  count: number
}

export interface PVTrendResponse {
  status: 'ok' | 'insufficient_data'
  data: Array<{ date: string; total_pv: number }>
}

export interface HeatmapDay {
  date: string
  count: number
}

export interface HeatmapWeek {
  weekStart: string
  weekEnd: string
  count: number
  days: HeatmapDay[]
}

export interface HeatmapResponse {
  weeks: HeatmapWeek[]
}

export interface Article {
  id: string
  title: string
  url: string
  tags: string[]
  created_at: string
  likes_count: number
  stocks_count: number
  page_views_count: number
  comments_count: number
  likes_rate: number | null
  stocks_rate: number | null
}

export interface SyncStatus {
  syncing: boolean
  lastSyncedAt: string | null
}

export type TrendMetric = 'likes'
export type ArticleSortColumn = 'created_at' | 'likes_count' | 'stocks_count' | 'page_views_count' | 'likes_rate' | 'stocks_rate'
export type RankingMetric = 'likes_count' | 'stocks_count' | 'page_views_count' | 'likes_rate' | 'stocks_rate'
