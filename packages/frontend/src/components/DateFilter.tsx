interface Props {
  label: string
  from: string
  to: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
  type?: 'month' | 'date'
}

export default function DateFilter({ label, from, to, onFromChange, onToChange, type = 'month' }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <input
        type={type}
        value={from}
        onChange={e => onFromChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <span className="text-gray-400 text-sm">〜</span>
      <input
        type={type}
        value={to}
        onChange={e => onToChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {(from || to) && (
        <button
          onClick={() => { onFromChange(''); onToChange('') }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          クリア
        </button>
      )}
    </div>
  )
}
