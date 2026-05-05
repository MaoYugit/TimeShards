import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AdminDocument } from "./schemas/admin.schema";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "管理员登录" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "登录成功",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "用户名或密码错误",
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "刷新 Token" })
  @ApiResponse({
    status: 200,
    description: "刷新成功",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "未授权",
  })
  async refreshToken(
    @CurrentUser() admin: AdminDocument,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshToken(admin);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "获取当前管理员信息" })
  @ApiResponse({
    status: 200,
    description: "成功获取管理员信息",
  })
  @ApiResponse({
    status: 401,
    description: "未授权",
  })
  async getProfile(@CurrentUser() admin: AdminDocument) {
    return this.authService.getProfile(admin);
  }
}
