import {
  Injectable,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Admin, AdminDocument } from "./schemas/admin.schema";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { JwtPayload } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 模块初始化时检查是否需要创建默认管理员
   */
  async onModuleInit() {
    await this.ensureAdminExists();
  }

  /**
   * 确保存在管理员账户
   */
  private async ensureAdminExists() {
    const adminCount = await this.adminModel.countDocuments();

    if (adminCount === 0) {
      const username = this.configService.get<string>("app.adminUsername");
      const password = this.configService.get<string>("app.adminPassword");

      if (!username || !password) {
        this.logger.warn(
          "ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping default admin creation",
        );
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await this.adminModel.create({
        username,
        passwordHash,
        role: "admin",
      });

      this.logger.log(`Default admin user '${username}' created`);
    }
  }

  /**
   * 管理员登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    // 查找管理员（包含密码字段）
    const admin = await this.adminModel
      .findOne({ username })
      .select("+passwordHash");

    if (!admin) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    // 生成 JWT
    const payload: JwtPayload = {
      sub: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    };

    const expiresIn = this.configService.get<string>("app.jwtExpiresIn", "7d");
    const expiresInMs = this.parseExpiresIn(expiresIn);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    this.logger.log(`Admin '${username}' logged in successfully`);

    return {
      accessToken,
      expiresIn: expiresInMs,
      tokenType: "Bearer",
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(admin: AdminDocument): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    };

    const expiresIn = this.configService.get<string>("app.jwtExpiresIn", "7d");
    const expiresInMs = this.parseExpiresIn(expiresIn);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    return {
      accessToken,
      expiresIn: expiresInMs,
      tokenType: "Bearer",
    };
  }

  /**
   * 获取管理员信息
   */
  async getProfile(admin: AdminDocument) {
    return {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  /**
   * 解析过期时间字符串为毫秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // 默认 7 天
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
