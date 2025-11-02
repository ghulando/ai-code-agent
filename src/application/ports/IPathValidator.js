/**
 * IPathValidator Interface (Port)
 * Defines the contract for path validation services
 * Implementation will be in infrastructure layer
 */
class IPathValidator {
  /**
   * Validate a repository path
   * @param {string} repositoryPath - Path to validate
   * @returns {Object} { isValid: boolean, error: string, normalizedPath: string }
   */
  validatePath(repositoryPath) {
    throw new Error('Method validatePath() must be implemented');
  }

  /**
   * Check if path is within allowed directories
   * @param {string} path - Path to check
   * @returns {boolean}
   */
  isPathAllowed(path) {
    throw new Error('Method isPathAllowed() must be implemented');
  }
}

module.exports = IPathValidator;
