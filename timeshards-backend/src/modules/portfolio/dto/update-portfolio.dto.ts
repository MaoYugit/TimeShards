import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectLinkDto } from './create-portfolio.dto';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({
    description: '项目名称',
    example: 'TimeShards',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: '时间段',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  period?: string;

  @ApiPropertyOptional({
    description: '项目简介',
    example: '个人博客系统',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({
    description: '技术标签',
    example: ['Vue', 'NestJS', 'MongoDB'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '项目链接',
    type: [ProjectLinkDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  links?: ProjectLinkDto[];

  @ApiPropertyOptional({
    description: '展示图 URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: '图片说明',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  showcaseNote?: string;

  @ApiPropertyOptional({
    description: '排序权重',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
