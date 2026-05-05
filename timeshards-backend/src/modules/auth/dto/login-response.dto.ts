import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
  @ApiProperty({ description: "JWT 访问令牌" })
  accessToken: string;

  @ApiProperty({ description: "过期时间（秒）", example: 604800 })
  expiresIn: number;

  @ApiProperty({ description: "令牌类型", example: "Bearer" })
  tokenType: string;
}
