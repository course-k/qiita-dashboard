import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api/client'
import type { PVTrendResponse } from '../types'

interface Props {
  refreshKey: number
}

const DAY_MS = 24 * 60 * 60 * 1000

function formatAxisDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(5, 10)
}

export default function PVTrendChart({ refreshKey }: Props) {
  const [result, setResult] = useState<PVTrendResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getPVTrend().then(setResult).finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">PV累計推移</h2>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
      </div>
    )
  }

  if (!result || result.status === 'insufficient_data') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">PV累計推移</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm">データ蓄積中</p>
            <p className="text-gray-400 text-xs mt-1">毎日アクセスすることでグラフが表示されます</p>
          </div>
        </div>
      </div>
    )
  }

  const initialPv = result.data[0].total_pv
  const maxPv = Math.max(...result.data.map(item => item.total_pv))
  const yAxisDomain: [number, number | 'dataMax'] = initialPv === maxPv ? [Math.max(initialPv - 1, 0), initialPv + 1] : [initialPv, 'dataMax']
  const chartData = result.data.map(item => ({
    ...item,
    timestamp: new Date(`${item.date}T00:00:00Z`).getTime(),
  }))
  const lastTimestamp = chartData[chartData.length - 1].timestamp
  const xAxisDomain: [number | 'dataMin', number | 'dataMax'] = chartData.length < 7 ? [lastTimestamp - 6 * DAY_MS, lastTimestamp] : ['dataMin', 'dataMax']

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-semibold text-gray-900">PV累計推移</h2>
        <span className="text-xs text-gray-500">基準: {initialPv.toLocaleString()} PV</span>
      </div>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={xAxisDomain}
            tick={{ fontSize: 11 }}
            tickFormatter={formatAxisDate}
          />
          <YAxis tick={{ fontSize: 11 }} domain={yAxisDomain} width={54} />
          <Tooltip
            formatter={(value: number) => value.toLocaleString()}
            labelFormatter={(value: number) => new Date(value).toISOString().slice(0, 10)}
          />
          <Line type="monotone" dataKey="total_pv" name="累計PV" stroke="#9333ea" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
