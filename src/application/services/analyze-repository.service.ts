import { Injectable } from '@nestjs/common';
import { CliFactoryService } from '../../infrastructure/cli-factory/cli-factory.service';
import { PathValidatorService } from '../../infrastructure/validation/path-validator.service';
import { ResponseFormatterService } from '../../infrastructure/formatters/response-formatter.service';
import { RepositoryAnalysis } from '../../domain/entities/RepositoryAnalysis';
import { ValidationError, CodexExecutionError, GeminiExecutionError, PathAccessError } from '../../domain/errors';

/**
 * Analyze Repository Service
 * Orchestrates repository analysis business logic
 */
@Injectable()
export class AnalyzeRepositoryService {
  constructor(
    private readonly cliFactory: CliFactoryService,
    private readonly pathValidator: PathValidatorService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  /**
   * Execute the service
   * @param repositoryPath - Path to repository
   * @param query - Analysis query
   * @param config - Optional configuration
   * @returns { analysis: Object, executionTime: number, metadata: Object }
   */
  async execute(repositoryPath: string, query: string, config: any = {}) {
    console.log('🔍 AnalyzeRepository service started');

    // Create domain entity
    const repoAnalysis = new RepositoryAnalysis(repositoryPath, query, config);

    // Validate using domain rules
    const validation = repoAnalysis.validate();
    if (!validation.isValid) {
      throw ValidationError.fromValidationResult(validation);
    }

    // Validate path access
    const pathValidation = this.pathValidator.validatePath(repoAnalysis.getRepositoryPath());

    if (!pathValidation.isValid) {
      throw new PathAccessError(
        pathValidation.error,
        repoAnalysis.getRepositoryPath(),
        'Path validation failed',
      );
    }

    try {
      // Get appropriate CLI service
      const cliService = this.cliFactory.getCliService();
      
      // Execute through service
      const result = await cliService.analyzeRepository(
        pathValidation.normalizedPath || repoAnalysis.getRepositoryPath(),
        repoAnalysis.getQuery(),
        repoAnalysis.getConfig(),
      );

      // Format response
      const formattedResponse = this.responseFormatter.formatResponse(result.output);

      console.log('✅ AnalyzeRepository service completed');

      return {
        analysis: formattedResponse,
        executionTime: result.executionTime,
        metadata: repoAnalysis.getMetadata(),
      };
    } catch (error) {
      console.error('❌ AnalyzeRepository service failed:', error.message);

      // If it's already a domain error, re-throw
      if (
        error instanceof ValidationError ||
        error instanceof CodexExecutionError ||
        error instanceof GeminiExecutionError ||
        error instanceof PathAccessError
      ) {
        throw error;
      }

      // Determine which error type to throw based on CLI type
      const cliType = process.env.CLI_TYPE?.toLowerCase() || 'codex';
      const ErrorClass = cliType === 'gemini' ? GeminiExecutionError : CodexExecutionError;

      throw new ErrorClass('Failed to analyze repository', error, {
        repositoryPath: repoAnalysis.getRepositoryPath(),
        query: repoAnalysis.getQuery().substring(0, 100),
      });
    }
  }
}
