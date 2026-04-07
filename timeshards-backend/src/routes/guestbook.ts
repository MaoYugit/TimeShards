import express from 'express'
import { GuestbookEntryModel } from '../models/GuestbookEntry.js'

const router = express.Router()
const MAX = 200

router.get('/', async (_req, res, next) => {
  try {
    const list = await GuestbookEntryModel.find()
      .sort({ createdAt: -1 })
      .limit(MAX)
      .lean()
      .exec()
    res.json(
      list.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        email: d.email,
        website: d.website,
        content: d.content,
        createdAt: d.createdAt.getTime(),
      })),
    )
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!name || name.length < 1 || name.length > 32 || !content || content.length > 2000) {
      res.status(400).json({ error: 'Invalid name or content' })
      return
    }
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const website = typeof body.website === 'string' ? body.website.trim() : ''

    const doc = await GuestbookEntryModel.create({
      name,
      email,
      website,
      content,
      createdAt: new Date(),
    })

    while ((await GuestbookEntryModel.countDocuments()) > MAX) {
      const oldest = await GuestbookEntryModel.findOne().sort({ createdAt: 1 }).select('_id').exec()
      if (!oldest) break
      await GuestbookEntryModel.deleteOne({ _id: oldest._id })
    }

    res.status(201).json({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      website: doc.website,
      content: doc.content,
      createdAt: doc.createdAt.getTime(),
    })
  } catch (e) {
    next(e)
  }
})

export const guestbookRouter: express.Router = router
