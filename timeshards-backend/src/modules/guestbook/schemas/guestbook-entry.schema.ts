import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type GuestbookEntryDocument = GuestbookEntry & Document;

@Schema({
  timestamps: true,
  collection: 'guestbookentries',
})
export class GuestbookEntry {
  @ApiProperty({ description: '留言 ID' })
  _id: string;

  @Prop({ required: true, trim: true, maxlength: 32 })
  @ApiProperty({ description: '昵称', example: '访客' })
  name: string;

  @Prop({ trim: true })
  @ApiPropertyOptional({ description: '邮箱', example: 'user@example.com' })
  email: string;

  @Prop({ trim: true })
  @ApiPropertyOptional({ description: '个人网站', example: 'https://example.com' })
  website: string;

  @Prop({ required: true, maxlength: 2000 })
  @ApiProperty({ description: '留言内容', example: '你好！' })
  content: string;

  @Prop()
  @ApiPropertyOptional({ description: 'IP 地址' })
  ip: string;

  @Prop()
  @ApiPropertyOptional({ description: 'User-Agent' })
  userAgent: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export const GuestbookEntrySchema = SchemaFactory.createForClass(GuestbookEntry);

// 创建索引
GuestbookEntrySchema.index({ createdAt: -1 });
