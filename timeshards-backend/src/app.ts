import express, { type Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { blogRouter } from './routes/blog.js'
import { guestbookRouter } from './routes/guestbook.js'
import { chatRouter } from './routes/chat.js'

export function createApp(): Application {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : true,
      credentials: true,
    }),
  )
  app.use(morgan('dev'))
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'timeshards-backend' })
  })

  app.use('/api/posts', blogRouter)
  app.use('/api/guestbook', guestbookRouter)
  app.use('/api/chat', chatRouter)

  app.use(
    (
      err: Error & { status?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      // eslint-disable-next-line no-console
      console.error(err)
      const status = err.status ?? 500
      res.status(status).json({
        error: status === 500 ? 'Internal Server Error' : err.message,
      })
    },
  )

  return app
}
