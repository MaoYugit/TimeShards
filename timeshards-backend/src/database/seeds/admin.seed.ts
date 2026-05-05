import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';

async function seed() {
  const logger = new Logger('Seed');

  try {
    logger.log('Starting database seeding...');

    // 创建应用上下文会触发所有模块的 onModuleInit
    // AuthService.onModuleInit() 会自动创建默认管理员
    const app = await NestFactory.createApplicationContext(AppModule);

    logger.log('Database seeding completed');

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', error);
    process.exit(1);
  }
}

seed();
