import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.js'

/**
 * 若配置了 ADMIN_API_KEY，则请求头需带：X-API-Key: <key>
 * 未配置时开发环境不校验（生产环境务必配置）
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!env.adminApiKey) {
    return next()
  }
  const key = req.header('x-api-key') ?? ''
  if (key !== env.adminApiKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}
