import mongoose, { Schema } from 'mongoose'

export interface GuestbookEntryDoc {
  name: string
  email: string
  website: string
  content: string
  createdAt: Date
}

const guestbookSchema = new Schema<GuestbookEntryDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
)

guestbookSchema.index({ createdAt: -1 })

export const GuestbookEntryModel = mongoose.model<GuestbookEntryDoc>(
  'GuestbookEntry',
  guestbookSchema,
)
