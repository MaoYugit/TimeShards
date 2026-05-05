import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export type BlogPostDocument = BlogPost & Document;

export enum BlogCategory {
  FRONTEND = "前端",
  ENGINEERING = "工程化",
  AI_DEVELOPMENT = "AI 开发",
  ESSAY = "随笔",
}

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Schema({
  timestamps: true,
  collection: "blogposts",
})
export class BlogPost {
  @ApiProperty({ description: "文章 ID" })
  _id: string;

  @Prop({ required: true, trim: true })
  @ApiProperty({ description: "标题", example: "我的第一篇文章" })
  title: string;

  @Prop({ trim: true, lowercase: true })
  @ApiPropertyOptional({
    description: "URL 友好的标识符（留空自动生成）",
    example: "my-first-post",
  })
  slug: string;

  @Prop({ trim: true, maxlength: 300 })
  @ApiPropertyOptional({ description: "摘要", example: "这是文章摘要..." })
  summary: string;

  @Prop({ type: String, enum: BlogStatus, default: BlogStatus.DRAFT })
  @ApiProperty({
    description: "状态",
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
  })
  status: BlogStatus;

  @Prop()
  @ApiPropertyOptional({ description: "发布日期" })
  publishedAt: Date;

  @Prop()
  @ApiProperty({ description: "更新日期" })
  updatedAt: Date;

  @Prop({ default: 0 })
  @ApiProperty({ description: "阅读量", example: 0 })
  viewCount: number;

  @Prop({ required: true, type: String, enum: BlogCategory })
  @ApiProperty({
    description: "分类",
    enum: BlogCategory,
    example: BlogCategory.FRONTEND,
  })
  category: BlogCategory;

  @Prop({ type: [String], default: [] })
  @ApiProperty({ description: "标签", example: ["Vue", "TypeScript"] })
  tags: string[];

  @Prop()
  @ApiPropertyOptional({ description: "封面图 URL" })
  coverImage: string;

  @Prop({ required: true })
  @ApiProperty({ description: "Markdown 正文" })
  content: string;

  @Prop({ type: String, ref: "Admin" })
  @ApiProperty({ description: "作者 ID" })
  authorId: string;

  @ApiProperty({ description: "创建时间" })
  createdAt: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

// 创建索引
BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ category: 1, status: 1 });
BlogPostSchema.index({ publishedAt: -1 });
BlogPostSchema.index({ createdAt: -1 });

// 自动生成 slug（如果未提供）
BlogPostSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    // 生成 slug：转小写，替换非字母数字中文为连字符
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 如果 slug 为空（例如纯中文标题），使用时间戳
    if (!slug) {
      slug = "post-" + Date.now();
    }

    this.slug = slug;
  }
  next();
});
