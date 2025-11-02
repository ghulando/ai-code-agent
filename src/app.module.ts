import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { CodeGenerationModule } from './presentation/controllers/code-generation.module';
import { RepositoryModule } from './presentation/controllers/repository.module';
import { HealthModule } from './presentation/controllers/health.module';

@Module({
  imports: [AppConfigModule, CodeGenerationModule, RepositoryModule, HealthModule],
})
export class AppModule {}
