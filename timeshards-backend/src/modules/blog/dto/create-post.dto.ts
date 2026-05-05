import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  MinLength,
} from "class-validator";
import { BlogCategory, BlogStatus } from "../schemas/blog-post.schema";

export class CreatePostDto {
  @ApiProperty({
    description: "文章标题",
    example: "我的第一篇文章",
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: "URL 友好的标识符（留空自动生成）",
    example: "my-first-post",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({
    description: "摘要（留空自动截取正文前 150 字）",
    example: "这是文章摘要...",
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @ApiPropertyOptional({
    description: "状态",
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiProperty({
    description: "分类",
    enum: BlogCategory,
    example: BlogCategory.FRONTEND,
  })
  @IsEnum(BlogCategory)
  category: BlogCategory;

  @ApiPropertyOptional({
    description: "标签",
    example: ["Vue", "TypeScript"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "封面图 URL",
    example: "https://example.com/cover.jpg",
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({
    description: "Markdown 正文",
    example: "# 标题\n\n这是正文内容...",
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
