import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CodexCliService } from '../codex/codex-cli.service';
import { GeminiCliService } from '../gemini/gemini-cli.service';
import { CodexExecutionError, GeminiExecutionError } from '../../domain/errors';

/**
 * CLI Factory Service
 * Provides the appropriate CLI service based on configuration
 */
@Injectable()
export class CliFactoryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly codexService: CodexCliService,
    private readonly geminiService: GeminiCliService,
  ) {}

  /**
   * Get the appropriate CLI service based on CLI_TYPE environment variable
   * Defaults to 'codex' for backward compatibility
   */
  getCliService(): CodexCliService | GeminiCliService {
    const cliType = this.getCliType();
    
    console.log(`🔧 Using CLI type: ${cliType}`);
    
    if (cliType === 'gemini') {
      return this.geminiService;
    }
    
    return this.codexService;
  }

  /**
   * Get the CLI type from configuration
   * Defaults to 'codex' for backward compatibility
   */
  getCliType(): string {
    return this.configService.get<string>('cliType')?.toLowerCase() || 'codex';
  }

  /**
   * Get the appropriate error class based on CLI type
   */
  getErrorClass(): typeof CodexExecutionError | typeof GeminiExecutionError {
    const cliType = this.getCliType();
    return cliType === 'gemini' ? GeminiExecutionError : CodexExecutionError;
  }
}
