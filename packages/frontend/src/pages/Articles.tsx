import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Article, ArticleSortColumn } from '../types'
import DateFilter from '../components/DateFilter'
import RankingCard from '../components/RankingCard'
import ArticleTable from '../components/ArticleTable'

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<ArticleSortColumn>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    setLoading(true)
    api.getArticles({ from: from || undefined, to: to || undefined, sort, order })
      .then(setArticles)
      .finally(() => setLoading(false))
  }, [from, to, sort, order])

  function handleSort(col: ArticleSortColumn) {
    if (sort === col) {
      setOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(col)
      setOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      <RankingCard />

      <div className="flex items-center justify-between">
        <DateFilter
          label="投稿日"
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          type="date"
        />
        <p className="text-sm text-gray-500">{articles.length}件</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : (
        <ArticleTable articles={articles} sort={sort} order={order} onSort={handleSort} />
      )}
    </div>
  )
}
