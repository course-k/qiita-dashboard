import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Article, RankingMetric } from '../types'

const METRICS: { value: RankingMetric; label: string }[] = [
  { value: 'likes_count', label: 'いいね' },
  { value: 'stocks_count', label: 'ストック' },
  { value: 'page_views_count', label: 'PV' },
  { value: 'likes_rate', label: 'いいね率' },
  { value: 'stocks_rate', label: 'ストック率' },
]

function valueOf(article: Article, metric: RankingMetric): string {
  const v = article[metric]
  if (v === null || v === undefined) return '-'
  if (metric === 'likes_rate' || metric === 'stocks_rate') return `${v}%`
  return v.toLocaleString()
}

export default function RankingCard() {
  const [metric, setMetric] = useState<RankingMetric>('likes_count')
  const [data, setData] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getRanking(metric, 5).then(setData).finally(() => setLoading(false))
  }, [metric])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">ランキング TOP5</h2>
        <div className="flex gap-1 flex-wrap justify-end">
          {METRICS.map(m => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                metric === m.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : (
        <ol className="space-y-2">
          {data.map((article, i) => (
            <li key={article.id} className="flex items-center gap-3">
              <span className="w-6 text-sm font-bold text-gray-400 shrink-0">{i + 1}</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-gray-800 hover:text-green-600 line-clamp-1"
              >
                {article.title}
              </a>
              <span className="text-sm font-medium text-gray-700 shrink-0">
                {valueOf(article, metric)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
