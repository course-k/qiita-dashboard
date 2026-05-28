import { Router } from 'express'
import { runSync, getSyncStatus } from '../services/sync'

const router = Router()

router.get('/status', (_req, res) => {
  res.json(getSyncStatus())
})

router.post('/', async (_req, res) => {
  const { syncing } = getSyncStatus()
  if (syncing) {
    return res.status(409).json({ error: 'Sync already in progress' })
  }
  // 非同期で実行しレスポンスはすぐ返す
  runSync(true).catch(err => console.error('Sync error:', err))
  res.json({ message: 'Sync started' })
})

export default router
