const CodeGeneration = require('../../domain/entities/CodeGeneration');
const { ValidationError, CodexExecutionError } = require('../../domain/errors');

/**
 * Use Case: Generate Code
 * Orchestrates code generation business logic
 * Independent of HTTP/Express/external frameworks
 */
class GenerateCode {
  constructor(codexService) {
    if (!codexService) {
      throw new Error('CodexService is required');
    }
    this.codexService = codexService;
  }

  /**
   * Execute the use case
   * @param {string} prompt - Code generation prompt
   * @param {Object} config - Optional configuration
   * @returns {Promise<Object>} { response: string, executionTime: number, model: string, metadata: Object }
   */
  async execute(prompt, config = {}) {
    console.log('📝 GenerateCode use case started');

    // Create domain entity
    const codeGeneration = new CodeGeneration(prompt, config);

    // Validate using domain rules
    const validation = codeGeneration.validate();
    if (!validation.isValid) {
      throw ValidationError.fromValidationResult(validation);
    }

    try {
      // Execute through port
      const result = await this.codexService.generateCode(
        codeGeneration.getPrompt(),
        codeGeneration.getConfig()
      );

      console.log('✅ GenerateCode use case completed');

      return {
        response: result.output,
        executionTime: result.executionTime,
        model: result.model,
        metadata: codeGeneration.getMetadata()
      };
    } catch (error) {
      console.error('❌ GenerateCode use case failed:', error.message);
      
      throw new CodexExecutionError(
        'Failed to generate code',
        error,
        { prompt: codeGeneration.getPrompt().substring(0, 100) }
      );
    }
  }
}

module.exports = GenerateCode;
