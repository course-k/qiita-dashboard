import type { Article, ArticleSortColumn } from '../types'

interface Props {
  articles: Article[]
  sort: ArticleSortColumn
  order: 'asc' | 'desc'
  onSort: (col: ArticleSortColumn) => void
}

const COLUMNS: { key: ArticleSortColumn; label: string }[] = [
  { key: 'created_at', label: '投稿日' },
  { key: 'likes_count', label: 'いいね' },
  { key: 'stocks_count', label: 'ストック' },
  { key: 'page_views_count', label: 'PV' },
  { key: 'likes_rate', label: 'いいね率' },
  { key: 'stocks_rate', label: 'ストック率' },
]

export default function ArticleTable({ articles, sort, order, onSort }: Props) {
  function SortIcon({ col }: { col: ArticleSortColumn }) {
    if (sort !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-gray-700 ml-1">{order === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">タイトル</th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map(article => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-green-600 line-clamp-1 max-w-sm block"
                  >
                    {article.title}
                  </a>
                </td>
                <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">{article.created_at.slice(0, 10)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{article.likes_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-700">{article.stocks_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-700">{article.page_views_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {article.likes_rate !== null ? `${article.likes_rate}%` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {article.stocks_rate !== null ? `${article.stocks_rate}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">記事がありません</div>
        )}
      </div>
    </div>
  )
}
