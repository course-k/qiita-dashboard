import type { Summary } from '../types'

interface Props {
  summary: Summary
}

interface CardProps {
  label: string
  value: number
  unit?: string
}

function Card({ label, value, unit }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value.toLocaleString()}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export default function SummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="総記事数" value={summary.articles_count} unit="本" />
      <Card label="総いいね" value={summary.total_likes} />
      <Card label="総ストック" value={summary.total_stocks} />
      <Card label="総PV" value={summary.total_pv} />
    </div>
  )
}
