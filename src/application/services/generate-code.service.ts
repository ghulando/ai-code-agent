import { Injectable } from '@nestjs/common';
import { CliFactoryService } from '../../infrastructure/cli-factory/cli-factory.service';
import { CodeGeneration } from '../../domain/entities/CodeGeneration';
import { ValidationError, CodexExecutionError, GeminiExecutionError } from '../../domain/errors';

/**
 * Generate Code Service
 * Orchestrates code generation business logic
 */
@Injectable()
export class GenerateCodeService {
  constructor(private readonly cliFactory: CliFactoryService) {}

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
      // Get appropriate CLI service
      const cliService = this.cliFactory.getCliService();
      
      // Execute through service
      const result = await cliService.generateCode(
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

      // Determine which error type to throw based on CLI type
      const cliType = process.env.CLI_TYPE?.toLowerCase() || 'codex';
      const ErrorClass = cliType === 'gemini' ? GeminiExecutionError : CodexExecutionError;

      throw new ErrorClass('Failed to generate code', error, {
        prompt: codeGeneration.getPrompt().substring(0, 100),
      });
    }
  }
}
