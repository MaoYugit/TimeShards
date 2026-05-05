import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: '用户 ID',
    example: 'user_123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '昵称',
    example: '访客',
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  nickname: string;

  @ApiPropertyOptional({
    description: '头像色相',
    example: 180,
    minimum: 0,
    maximum: 359,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(359)
  avatarHue?: number;

  @ApiProperty({
    description: '消息内容',
    example: '你好！',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;
}
