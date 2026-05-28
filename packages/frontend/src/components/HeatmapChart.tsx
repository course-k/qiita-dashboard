import { useEffect, useState } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import type { ReactCalendarHeatmapValue, TooltipDataAttrs } from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { api } from '../api/client'
import type { HeatmapPoint } from '../types'

export default function HeatmapChart() {
  const [data, setData] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getHeatmap().then(setData).finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">投稿頻度</h2>
      {loading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
      ) : (
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={data}
            classForValue={value => {
              if (!value || (value as HeatmapPoint).count === 0) return 'color-empty'
              const count = (value as HeatmapPoint).count
              if (count >= 3) return 'color-scale-4'
              if (count === 2) return 'color-scale-2'
              return 'color-scale-1'
            }}
            tooltipDataAttrs={(value: ReactCalendarHeatmapValue<string> | undefined) => {
              const v = value as HeatmapPoint | undefined
              return (v?.date ? { 'data-tip': `${v.date}: ${v.count}件` } : {}) as TooltipDataAttrs
            }}
          />
        </div>
      )}
    </div>
  )
}
