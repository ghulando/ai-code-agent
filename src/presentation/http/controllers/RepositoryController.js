const { ValidationError, CodexExecutionError, PathAccessError } = require('../../../domain/errors');

/**
 * Repository Controller
 * Handles HTTP requests for repository analysis
 */
class RepositoryController {
  constructor(analyzeRepositoryUseCase) {
    if (!analyzeRepositoryUseCase) {
      throw new Error('AnalyzeRepositoryUseCase is required');
    }
    this.analyzeRepositoryUseCase = analyzeRepositoryUseCase;
  }

  async handle(req, res) {
    try {
      const { repositoryPath, query, config: requestConfig } = req.body;

      console.log('🔍 Repository analysis request:', {
        repositoryPath,
        queryLength: query?.length
      });

      // Execute use case
      const result = await this.analyzeRepositoryUseCase.execute(
        repositoryPath,
        query,
        requestConfig
      );

      console.log('✅ Repository analysis completed:', { executionTime: result.executionTime + 'ms' });

      res.status(200).json({
        success: true,
        data: {
          analysis: result.analysis,
          executionTime: result.executionTime,
          repositoryPath: result.metadata.repositoryPath
        }
      });

    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  handleError(error, req, res) {
    console.error('Error in RepositoryController:', error.message);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        errors: error.errors
      });
    }

    if (error instanceof PathAccessError) {
      return res.status(400).json({
        error: 'Invalid Repository Path',
        message: error.message,
        path: error.path
      });
    }

    if (error instanceof CodexExecutionError) {
      return res.status(500).json({
        error: 'Execution Error',
        message: 'Failed to analyze repository',
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

module.exports = RepositoryController;
