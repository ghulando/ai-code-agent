const { ValidationError, CodexExecutionError, PathAccessError } = require('../../../domain/errors');

/**
 * Code Generation Controller
 * Handles HTTP requests for code generation
 */
class CodeGenerationController {
  constructor(generateCodeUseCase) {
    if (!generateCodeUseCase) {
      throw new Error('GenerateCodeUseCase is required');
    }
    this.generateCodeUseCase = generateCodeUseCase;
  }

  async handle(req, res) {
    try {
      const { prompt, config: requestConfig } = req.body;

      console.log('📝 Code generation request received:', { promptLength: prompt?.length });

      // Execute use case
      const result = await this.generateCodeUseCase.execute(prompt, requestConfig);

      console.log('✅ Code generation request completed:', { executionTime: result.executionTime + 'ms' });

      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          executionTime: result.executionTime,
          model: result.model
        }
      });

    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  handleError(error, req, res) {
    console.error('Error in CodeGenerationController:', error.message);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        errors: error.errors
      });
    }

    if (error instanceof CodexExecutionError) {
      return res.status(500).json({
        error: 'Execution Error',
        message: 'Failed to process Codex command',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = CodeGenerationController;
