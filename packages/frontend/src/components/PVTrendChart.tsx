import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api/client'
import type { PVTrendResponse } from '../types'

interface Props {
  refreshKey: number
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">PV累計推移</h2>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={result.data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="total_pv" name="累計PV" stroke="#9333ea" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
