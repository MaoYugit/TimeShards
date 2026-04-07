import mongoose, { Schema } from 'mongoose'

export interface ChatMessageDoc {
  userId: string
  nickname: string
  avatarHue: number
  text: string
  createdAt: Date
}

const chatMessageSchema = new Schema<ChatMessageDoc>(
  {
    userId: { type: String, required: true, index: true },
    nickname: { type: String, required: true, trim: true },
    avatarHue: { type: Number, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
)

chatMessageSchema.index({ createdAt: 1 })

export const ChatMessageModel = mongoose.model<ChatMessageDoc>('ChatMessage', chatMessageSchema)
