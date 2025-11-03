import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { CodeGenerationController } from './code-generation.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [CodeGenerationController],
})
export class CodeGenerationModule {}
