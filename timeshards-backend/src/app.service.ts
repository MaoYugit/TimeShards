import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>("app.nodeEnv"),
      version: "1.0.0",
    };
  }
}
