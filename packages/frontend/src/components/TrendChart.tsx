import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TrendMetric } from '../types'

interface Props {
  from: string
  to: string
}

const METRICS: { value: TrendMetric; label: string; color: string }[] = [
  { value: 'likes', label: 'いいね', color: '#16a34a' },
  { value: 'stocks', label: 'ストック', color: '#2563eb' },
  { value: 'pv', label: 'PV', color: '#9333ea' },
]

import { useEffect } from 'react'
import { api } from '../api/client'
import type { TrendPoint } from '../types'

export default function TrendChart({ from, to }: Props) {
  const [metric, setMetric] = useState<TrendMetric>('likes')
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getTrend(metric, from || undefined, to || undefined)
      .then(setData)
      .finally(() => setLoading(false))
  }, [metric, from, to])

  const current = METRICS.find(m => m.value === metric)!

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">月次推移</h2>
        <div className="flex gap-1">
          {METRICS.map(m => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
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
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">データがありません</div>
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" name={current.label} fill={current.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
