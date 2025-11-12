import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CodexCliService } from '../codex/codex-cli.service';
import { GeminiCliService } from '../gemini/gemini-cli.service';

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
    const cliType = (this.configService.get<string>('cliType')?.toLowerCase() || 'codex');
    
    console.log(`🔧 Using CLI type: ${cliType}`);
    
    if (cliType === 'gemini') {
      return this.geminiService;
    }
    
    return this.codexService;
  }
}
