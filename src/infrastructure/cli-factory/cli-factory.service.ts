import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CodexCliService } from '../codex/codex-cli.service';
import { GeminiCliService } from '../gemini/gemini-cli.service';
import { ClaudeCliService } from '../claude/claude-cli.service';
import { CodexExecutionError, GeminiExecutionError, ClaudeExecutionError } from '../../domain/errors';

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
    private readonly claudeService: ClaudeCliService,
  ) {}

  /**
   * Get the appropriate CLI service based on CLI_TYPE environment variable
   * Defaults to 'codex' for backward compatibility
   */
  getCliService(): CodexCliService | GeminiCliService | ClaudeCliService {
    const cliType = this.getCliType();
    
    console.log(`🔧 Using CLI type: ${cliType}`);
    
    if (cliType === 'gemini') {
      return this.geminiService;
    }
    
    if (cliType === 'claude') {
      return this.claudeService;
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
  getErrorClass(): typeof CodexExecutionError | typeof GeminiExecutionError | typeof ClaudeExecutionError {
    const cliType = this.getCliType();
    if (cliType === 'gemini') {
      return GeminiExecutionError;
    }
    if (cliType === 'claude') {
      return ClaudeExecutionError;
    }
    return CodexExecutionError;
  }
}
