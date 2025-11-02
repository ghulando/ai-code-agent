import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { GenerateCodeService } from './services/generate-code.service';
import { AnalyzeRepositoryService } from './services/analyze-repository.service';
import { CheckHealthService } from './services/check-health.service';

@Module({
  imports: [InfrastructureModule],
  providers: [GenerateCodeService, AnalyzeRepositoryService, CheckHealthService],
  exports: [GenerateCodeService, AnalyzeRepositoryService, CheckHealthService],
})
export class ApplicationModule {}
