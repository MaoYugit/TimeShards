import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/timeshards',
  adminApiKey: process.env.ADMIN_API_KEY?.trim() ?? '',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}
