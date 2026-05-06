import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class HomepageConfigDto {
  @ApiPropertyOptional({
    description: '欢迎语',
    example: '「欢迎来到 TimeShards —— 愿这片小站能成为你浏览路上的一处歇脚点。」',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  welcomeQuote?: string;

  @ApiPropertyOptional({
    description: '介绍文字',
    example: '这里是我的个人站点：记录作品集、博客与一些实验。',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  welcomeIntro?: string;
}
