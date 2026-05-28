import { Router } from 'express'
import { fetchAuthenticatedUser } from '../services/qiita'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const user = await fetchAuthenticatedUser()
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

export default router
