import cron from 'node-cron'
import { runSync } from '../services/sync'

export function startScheduler(): void {
  // 毎朝9時に差分同期を実行
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled sync...')
    await runSync(false)
  }, {
    timezone: 'Asia/Tokyo',
  })

  console.log('Scheduler started (daily sync at 09:00 JST)')
}
