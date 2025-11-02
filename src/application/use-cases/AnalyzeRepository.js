const RepositoryAnalysis = require('../../domain/entities/RepositoryAnalysis');
const { ValidationError, CodexExecutionError, PathAccessError } = require('../../domain/errors');

/**
 * Use Case: Analyze Repository
 * Orchestrates repository analysis business logic
 * Independent of HTTP/Express/external frameworks
 */
class AnalyzeRepository {
  constructor(codexService, pathValidator, responseFormatter) {
    if (!codexService) {
      throw new Error('CodexService is required');
    }
    if (!pathValidator) {
      throw new Error('PathValidator is required');
    }
    if (!responseFormatter) {
      throw new Error('ResponseFormatter is required');
    }

    this.codexService = codexService;
    this.pathValidator = pathValidator;
    this.responseFormatter = responseFormatter;
  }

  /**
   * Execute the use case
   * @param {string} repositoryPath - Path to repository
   * @param {string} query - Analysis query
   * @param {Object} config - Optional configuration
   * @returns {Promise<Object>} { analysis: Object, executionTime: number, metadata: Object }
   */
  async execute(repositoryPath, query, config = {}) {
    console.log('🔍 AnalyzeRepository use case started');

    // Create domain entity
    const repoAnalysis = new RepositoryAnalysis(repositoryPath, query, config);

    // Validate using domain rules
    const validation = repoAnalysis.validate();
    if (!validation.isValid) {
      throw ValidationError.fromValidationResult(validation);
    }

    // Validate path access
    const pathValidation = this.pathValidator.validatePath(
      repoAnalysis.getRepositoryPath()
    );

    if (!pathValidation.isValid) {
      throw new PathAccessError(
        pathValidation.error,
        repoAnalysis.getRepositoryPath(),
        'Path validation failed'
      );
    }

    try {
      // Execute through port
      const result = await this.codexService.analyzeRepository(
        pathValidation.normalizedPath || repoAnalysis.getRepositoryPath(),
        repoAnalysis.getQuery(),
        repoAnalysis.getConfig()
      );

      // Format response
      const formattedResponse = this.responseFormatter.formatResponse(result.output);

      console.log('✅ AnalyzeRepository use case completed');

      return {
        analysis: formattedResponse,
        executionTime: result.executionTime,
        metadata: repoAnalysis.getMetadata()
      };
    } catch (error) {
      console.error('❌ AnalyzeRepository use case failed:', error.message);

      // If it's already a domain error, re-throw
      if (error.name && error.name.includes('Error')) {
        throw error;
      }

      throw new CodexExecutionError(
        'Failed to analyze repository',
        error,
        {
          repositoryPath: repoAnalysis.getRepositoryPath(),
          query: repoAnalysis.getQuery().substring(0, 100)
        }
      );
    }
  }
}

module.exports = AnalyzeRepository;
