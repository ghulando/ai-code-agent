import { Module } from '@nestjs/common';
import { CodexCliService } from './codex/codex-cli.service';
import { GeminiCliService } from './gemini/gemini-cli.service';
import { CliFactoryService } from './cli-factory/cli-factory.service';
import { PathValidatorService } from './validation/path-validator.service';
import { ResponseFormatterService } from './formatters/response-formatter.service';

@Module({
  providers: [CodexCliService, GeminiCliService, CliFactoryService, PathValidatorService, ResponseFormatterService],
  exports: [CodexCliService, GeminiCliService, CliFactoryService, PathValidatorService, ResponseFormatterService],
})
export class InfrastructureModule {}
