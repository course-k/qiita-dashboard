import type {
  Profile, Summary, TrendPoint, PVTrendResponse,
  HeatmapResponse, Article, SyncStatus, TrendMetric,
  ArticleSortColumn, RankingMetric,
} from '../types'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function post<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'POST' })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  getProfile: () => get<Profile>('/api/profile'),

  getSummary: () => get<Summary>('/api/stats/summary'),

  getTrend: (metric: TrendMetric, from?: string, to?: string) => {
    const params = new URLSearchParams({ metric })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return get<TrendPoint[]>(`/api/stats/trend?${params}`)
  },

  getPVTrend: () => get<PVTrendResponse>('/api/stats/pv-trend'),

  getHeatmap: () => get<HeatmapResponse>('/api/stats/heatmap'),

  getArticles: (params: {
    from?: string
    to?: string
    sort?: ArticleSortColumn
    order?: 'asc' | 'desc'
  } = {}) => {
    const q = new URLSearchParams()
    if (params.from) q.set('from', params.from)
    if (params.to) q.set('to', params.to)
    if (params.sort) q.set('sort', params.sort)
    if (params.order) q.set('order', params.order)
    return get<Article[]>(`/api/articles?${q}`)
  },

  getRanking: (metric: RankingMetric, limit = 5) =>
    get<Article[]>(`/api/articles/ranking?metric=${metric}&limit=${limit}`),

  getSyncStatus: () => get<SyncStatus>('/api/sync/status'),

  triggerSync: () => post<{ message: string }>('/api/sync'),
}
