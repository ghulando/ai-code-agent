import { Injectable } from '@nestjs/common';
import { CodexCliService } from '../../infrastructure/codex/codex-cli.service';
import { CodeGeneration } from '../../domain/entities/CodeGeneration';
import { ValidationError, CodexExecutionError } from '../../domain/errors';

/**
 * Generate Code Service
 * Orchestrates code generation business logic
 */
@Injectable()
export class GenerateCodeService {
  constructor(private readonly codexService: CodexCliService) {}

  /**
   * Execute the service
   * @param prompt - Code generation prompt
   * @param config - Optional configuration
   * @returns { response: string, executionTime: number, model: string, metadata: Object }
   */
  async execute(prompt: string, config: any = {}) {
    console.log('📝 GenerateCode service started');

    // Create domain entity
    const codeGeneration = new CodeGeneration(prompt, config);

    // Validate using domain rules
    const validation = codeGeneration.validate();
    if (!validation.isValid) {
      throw ValidationError.fromValidationResult(validation);
    }

    try {
      // Execute through service
      const result = await this.codexService.generateCode(
        codeGeneration.getPrompt(),
        codeGeneration.getConfig(),
      );

      console.log('✅ GenerateCode service completed');

      return {
        response: result.output,
        executionTime: result.executionTime,
        model: result.model,
        metadata: codeGeneration.getMetadata(),
      };
    } catch (error) {
      console.error('❌ GenerateCode service failed:', error.message);

      throw new CodexExecutionError('Failed to generate code', error, {
        prompt: codeGeneration.getPrompt().substring(0, 100),
      });
    }
  }
}
