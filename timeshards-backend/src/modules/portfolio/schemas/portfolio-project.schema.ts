import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type PortfolioProjectDocument = PortfolioProject & Document;

export class ProjectLink {
  @ApiProperty({ description: '链接标签', example: 'GitHub' })
  label: string;

  @ApiProperty({ description: '链接地址', example: 'https://github.com/...' })
  href: string;
}

@Schema({
  timestamps: true,
  collection: 'portfolioprojects',
})
export class PortfolioProject {
  @ApiProperty({ description: '作品 ID' })
  _id: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ description: '项目名称', example: 'TimeShards' })
  title: string;

  @Prop({ trim: true })
  @ApiPropertyOptional({ description: '时间段', example: '2024' })
  period: string;

  @Prop({ trim: true })
  @ApiPropertyOptional({ description: '项目简介', example: '个人博客系统' })
  summary: string;

  @Prop({ type: [String], default: [] })
  @ApiProperty({ description: '技术标签', example: ['Vue', 'NestJS', 'MongoDB'] })
  tags: string[];

  @Prop({ type: [{ label: String, href: String }], default: [] })
  @ApiPropertyOptional({ description: '项目链接', type: [ProjectLink] })
  links: ProjectLink[];

  @Prop({ trim: true })
  @ApiPropertyOptional({ description: '展示图 URL' })
  image: string;

  @Prop({ trim: true })
  @ApiPropertyOptional({ description: '图片说明' })
  showcaseNote: string;

  @Prop({ default: 0 })
  @ApiProperty({ description: '排序权重', example: 0 })
  sortOrder: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export const PortfolioProjectSchema = SchemaFactory.createForClass(PortfolioProject);

// 创建索引
PortfolioProjectSchema.index({ sortOrder: -1 });
PortfolioProjectSchema.index({ createdAt: -1 });
