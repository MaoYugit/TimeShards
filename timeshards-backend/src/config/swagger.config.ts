import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("TimeShards API")
    .setDescription("TimeShards 后端 API 文档")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter JWT token",
        in: "header",
      },
      "access-token",
    )
    .addTag("auth", "认证相关接口")
    .addTag("blog", "博客文章接口")
    .addTag("guestbook", "留言板接口")
    .addTag("chat", "聊天室接口")
    .addTag("portfolio", "作品集接口")
    .addTag("upload", "文件上传接口")
    .addTag("admin", "管理后台接口")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
