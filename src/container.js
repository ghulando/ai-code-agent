/**
 * Dependency Injection Container
 * Wires up all dependencies following Clean Architecture principles
 */

// Infrastructure Layer
const CodexCLIService = require('./infrastructure/codex/CodexCLIService');
const PathValidatorService = require('./infrastructure/validation/PathValidatorService');
const ResponseFormatterService = require('./infrastructure/formatters/ResponseFormatterService');

// Application Layer (Use Cases)
const { GenerateCode, AnalyzeRepository, CheckHealth } = require('./application/use-cases');

// Presentation Layer (Controllers)
const {
  CodeGenerationController,
  RepositoryController,
  HealthController
} = require('./presentation/http/controllers');

/**
 * Creates and configures all application dependencies
 * @returns {Object} Container with all wired dependencies
 */
function createContainer() {
  // Step 1: Create Infrastructure Services (implementations of ports)
  const codexService = new CodexCLIService();
  const pathValidator = new PathValidatorService();
  const responseFormatter = new ResponseFormatterService();

  // Step 2: Create Use Cases (inject infrastructure dependencies)
  const generateCodeUseCase = new GenerateCode(codexService);
  
  const analyzeRepositoryUseCase = new AnalyzeRepository(
    codexService,
    pathValidator,
    responseFormatter
  );
  
  const checkHealthUseCase = new CheckHealth();

  // Step 3: Create Controllers (inject use cases)
  const codeGenerationController = new CodeGenerationController(generateCodeUseCase);
  const repositoryController = new RepositoryController(analyzeRepositoryUseCase);
  const healthController = new HealthController(checkHealthUseCase);

  // Return container with all dependencies
  return {
    // Infrastructure
    codexService,
    pathValidator,
    responseFormatter,

    // Use Cases
    generateCodeUseCase,
    analyzeRepositoryUseCase,
    checkHealthUseCase,

    // Controllers
    controllers: {
      codeGenerationController,
      repositoryController,
      healthController
    }
  };
}

module.exports = createContainer;
