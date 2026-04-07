import express from 'express'
import { ChatMessageModel } from '../models/ChatMessage.js'
import { avatarHueFromUserId } from '../utils/avatarHue.js'

const router = express.Router()
const MAX = 400

router.get('/messages', async (_req, res, next) => {
  try {
    const list = await ChatMessageModel.find().sort({ createdAt: 1 }).limit(MAX).lean().exec()
    res.json(
      list.map((d) => ({
        id: d._id.toString(),
        userId: d.userId,
        nickname: d.nickname,
        avatarHue: d.avatarHue,
        text: d.text,
        createdAt: d.createdAt.getTime(),
      })),
    )
  } catch (e) {
    next(e)
  }
})

router.post('/messages', async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '匿名'
    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (!userId || !text || text.length > 2000) {
      res.status(400).json({ error: 'Invalid message' })
      return
    }

    const doc = await ChatMessageModel.create({
      userId,
      nickname: nickname.slice(0, 24) || '匿名',
      avatarHue: avatarHueFromUserId(userId),
      text,
      createdAt: new Date(),
    })

    while ((await ChatMessageModel.countDocuments()) > MAX) {
      const oldest = await ChatMessageModel.findOne().sort({ createdAt: 1 }).select('_id').exec()
      if (!oldest) break
      await ChatMessageModel.deleteOne({ _id: oldest._id })
    }

    res.status(201).json({
      id: doc._id.toString(),
      userId: doc.userId,
      nickname: doc.nickname,
      avatarHue: doc.avatarHue,
      text: doc.text,
      createdAt: doc.createdAt.getTime(),
    })
  } catch (e) {
    next(e)
  }
})

export const chatRouter: express.Router = router
