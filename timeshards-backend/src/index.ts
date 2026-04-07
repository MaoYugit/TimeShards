import { createApp } from './app.js'
import { connectDb } from './config/db.js'
import { env } from './config/env.js'

async function main() {
  await connectDb()
  const app = createApp()
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`timeshards-backend listening on http://127.0.0.1:${env.port}`)
  })
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})
