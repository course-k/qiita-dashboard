import { useEffect, useMemo, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { api } from '../api/client'
import type { HeatmapWeek } from '../types'

interface Props {
  refreshKey: number
}

function formatDate(date: string): string {
  return date.replace(/-/g, '/')
}

function getQuarterKey(date: string): string {
  const [year, month] = date.split('-').map(Number)
  const quarter = Math.floor((month - 1) / 3) + 1
  return `${year}-Q${quarter}`
}

function getWeekClass(count: number): string {
  if (count >= 2) return 'bg-green-700 hover:bg-green-800'
  if (count === 1) return 'bg-green-400 hover:bg-green-500'
  return 'bg-gray-100 hover:bg-gray-200'
}

function getDayClass(count: number): string {
  if (count >= 2) return 'bg-green-600'
  if (count === 1) return 'bg-green-300'
  return 'bg-gray-100'
}

function formatShortRange(start: string, end: string): string {
  return `${start.slice(5).replace('-', '/')} - ${end.slice(5).replace('-', '/')}`
}

function getWeekTooltip(week: HeatmapWeek): string {
  return `${formatShortDate(week.weekStart)} - ${formatShortDate(week.weekEnd)}: ${week.count}件`
}

function getDayTooltip(day: HeatmapWeek['days'][number]): string {
  return `${formatShortDate(day.date)}: ${day.count}件`
}

function formatShortDate(date: string): string {
  return date.slice(5).replace('-', '/')
}

export default function HeatmapChart({ refreshKey }: Props) {
  const [weeks, setWeeks] = useState<HeatmapWeek[]>([])
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getHeatmap()
      .then(response => {
        setWeeks(response.weeks)
        setSelectedWeekStart(current => current ?? [...response.weeks].reverse().find(week => week.count > 0)?.weekStart ?? null)
      })
      .finally(() => setLoading(false))
  }, [refreshKey])

  const selectedWeek = useMemo(() => {
    return weeks.find(week => week.weekStart === selectedWeekStart) ?? weeks[weeks.length - 1]
  }, [selectedWeekStart, weeks])

  const quarterGroups = useMemo(() => {
    const groups = new Map<string, HeatmapWeek[]>()

    for (const week of weeks) {
      const key = getQuarterKey(week.weekStart)
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)?.push(week)
    }

    return Array.from(groups.entries()).map(([key, groupWeeks]) => ({ key, weeks: groupWeeks }))
  }, [weeks])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="mb-3">
        <h2 className="font-semibold text-gray-900">投稿履歴</h2>
        <p className="mt-1 text-xs text-gray-500">記事の公開日を週ごとに集計しています</p>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="grid grid-cols-1 gap-2">
              {quarterGroups.map(group => (
                <div key={group.key} className="grid grid-cols-[92px_auto] items-center gap-3">
                  <div className="text-xs text-gray-400">
                    {formatShortRange(group.weeks[0].weekStart, group.weeks[group.weeks.length - 1].weekEnd)}
                  </div>
                  <div className="grid w-max grid-cols-[repeat(13,16px)] gap-1">
                    {Array.from({ length: 13 }, (_, slotIndex) => {
                      const week = group.weeks[slotIndex]
                      if (!week) {
                        return <div key={`empty-${slotIndex}`} className="h-4 w-4 rounded-sm" />
                      }

                      const active = selectedWeek?.weekStart === week.weekStart
                      const label = week.count > 0 ? '投稿あり' : 'なし'

                      return (
                        <button
                          key={week.weekStart}
                          type="button"
                          aria-label={`${formatDate(week.weekStart)}週 ${label}`}
                          data-tooltip-id="heatmap-tooltip"
                          data-tooltip-content={getWeekTooltip(week)}
                          onClick={() => setSelectedWeekStart(week.weekStart)}
                          className={`h-4 w-4 shrink-0 rounded-sm border transition ${getWeekClass(week.count)} ${
                            active ? 'border-gray-900 ring-1 ring-gray-900 ring-offset-1' : 'border-transparent'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedWeek && (
            <div className="border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs text-gray-500">
                選択中の週: {formatShortRange(selectedWeek.weekStart, selectedWeek.weekEnd)}
              </p>
              <div className="grid w-max grid-cols-7 gap-1">
                {selectedWeek.days.map(day => (
                  <div key={day.date} className="space-y-1">
                    <div
                      aria-label={`${formatDate(day.date)} ${day.count > 0 ? '投稿あり' : '投稿なし'}`}
                      data-tooltip-id="heatmap-tooltip"
                      data-tooltip-content={getDayTooltip(day)}
                      className={`h-4 w-4 rounded-sm ${getDayClass(day.count)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <Tooltip id="heatmap-tooltip" place="top" />
        </div>
      )}
    </div>
  )
}
