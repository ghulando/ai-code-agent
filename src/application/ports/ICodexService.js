/**
 * ICodexService Interface (Port)
 * Defines the contract for Codex interaction services
 * Implementation will be in infrastructure layer
 */
class ICodexService {
  /**
   * Execute a code generation command
   * @param {string} prompt - The prompt for code generation
   * @param {Object} config - Configuration options
   * @returns {Promise<Object>} { output: string, executionTime: number, model: string }
   */
  async generateCode(prompt, config = {}) {
    throw new Error('Method generateCode() must be implemented');
  }

  /**
   * Execute a repository analysis command
   * @param {string} repositoryPath - Path to the repository
   * @param {string} query - Analysis query
   * @param {Object} config - Configuration options
   * @returns {Promise<Object>} { output: string, executionTime: number }
   */
  async analyzeRepository(repositoryPath, query, config = {}) {
    throw new Error('Method analyzeRepository() must be implemented');
  }
}

module.exports = ICodexService;
