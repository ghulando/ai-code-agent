import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new DomainExceptionFilter());

  const port = configService.get<number>('port');
  await app.listen(port, '0.0.0.0');

  console.log('\n🚀 Code Agent Server Started (NestJS)');
  console.log(`   Environment: ${configService.get<string>('nodeEnv')}`);
  console.log(`   Port: ${port}`);
  console.log(`   Model: ${configService.get<string>('model.default')}`);
  console.log('\n📍 Endpoints:');
  console.log(`   Health:   http://localhost:${port}/health`);
  console.log(`   Generate: http://localhost:${port}/generate`);
  console.log(`   Analyze:  http://localhost:${port}/analyze-repo`);
  console.log('\n✅ Ready to accept requests\n');
}
bootstrap();
