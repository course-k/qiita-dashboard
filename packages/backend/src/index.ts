import express from 'express'
import cors from 'cors'
import path from 'path'

import { initDb } from './db/schema'
import { startScheduler } from './cron/scheduler'
import profileRouter from './routes/profile'
import statsRouter from './routes/stats'
import articlesRouter from './routes/articles'
import syncRouter from './routes/sync'

const app = express()
const PORT = process.env.PORT || 3001
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

app.use(cors())
app.use(express.json())

app.use('/api/profile', profileRouter)
app.use('/api/stats', statsRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/sync', syncRouter)

if (IS_PRODUCTION) {
  const staticPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(staticPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'))
  })
}

initDb()
startScheduler()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
