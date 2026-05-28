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
  const [from, setFrom] = useState(`${new Date().getFullYear()}-01`)
  const [to, setTo] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function loadDashboardData() {
    const [nextProfile, nextSummary, nextStatus] = await Promise.allSettled([
      api.getProfile(),
      api.getSummary(),
      api.getSyncStatus(),
    ])
    if (nextProfile.status === 'fulfilled') setProfile(nextProfile.value)
    if (nextSummary.status === 'fulfilled') setSummary(nextSummary.value)
    if (nextStatus.status === 'fulfilled') setSyncStatus(nextStatus.value)
  }

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
          await loadDashboardData()
          setRefreshKey(key => key + 1)
          setToast('同期が完了しました')
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

      {syncStatus && !syncStatus.lastSyncedAt && !syncStatus.syncing && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          まず同期を実行してください
        </div>
      )}

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
        <TrendChart from={from} to={to} refreshKey={refreshKey} />
        <PVTrendChart refreshKey={refreshKey} />
      </div>

      <HeatmapChart refreshKey={refreshKey} />

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
