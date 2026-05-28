import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Profile, Summary, SyncStatus } from '../types'
import ProfileCard from '../components/ProfileCard'
import SummaryCards from '../components/SummaryCards'
import DateFilter from '../components/DateFilter'
import TrendChart from '../components/TrendChart'
import PVTrendChart from '../components/PVTrendChart'
import HeatmapChart from '../components/HeatmapChart'

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    api.getProfile().then(setProfile)
    api.getSummary().then(setSummary)
    api.getSyncStatus().then(setSyncStatus)
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await api.triggerSync()
      // ステータスを2秒ごとにポーリングして完了を検知
      const poll = setInterval(async () => {
        const status = await api.getSyncStatus()
        setSyncStatus(status)
        if (!status.syncing) {
          clearInterval(poll)
          setSyncing(false)
          api.getSummary().then(setSummary)
        }
      }, 2000)
    } catch {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          {syncStatus?.lastSyncedAt && (
            <p className="text-xs text-gray-400">
              最終同期: {new Date(syncStatus.lastSyncedAt).toLocaleString('ja-JP')}
            </p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || syncStatus?.syncing}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing || syncStatus?.syncing ? '同期中...' : '今すぐ同期'}
        </button>
      </div>

      {/* プロフィール */}
      {profile && <ProfileCard profile={profile} />}

      {/* サマリー */}
      {summary && <SummaryCards summary={summary} />}

      {/* アクティビティ日フィルター */}
      <DateFilter
        label="期間"
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        type="month"
      />

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart from={from} to={to} />
        <PVTrendChart />
      </div>

      <HeatmapChart />
    </div>
  )
}
