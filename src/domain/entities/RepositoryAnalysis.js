/**
 * Domain Entity: RepositoryAnalysis
 * Encapsulates business rules for repository analysis requests
 * No dependencies on frameworks or external services
 */
class RepositoryAnalysis {
  constructor(repositoryPath, query, config = {}) {
    this.repositoryPath = repositoryPath;
    this.query = query;
    this.config = config;
    this.createdAt = new Date();
  }

  /**
   * Validates the repository analysis request
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Business Rule: Repository path is required
    if (!this.repositoryPath) {
      errors.push('Repository path is required');
    }

    // Business Rule: Repository path must be a string
    if (this.repositoryPath && typeof this.repositoryPath !== 'string') {
      errors.push('Repository path must be a string');
    }

    // Business Rule: Repository path cannot be empty
    if (this.repositoryPath && this.repositoryPath.trim().length === 0) {
      errors.push('Repository path cannot be empty');
    }

    // Business Rule: Query is required
    if (!this.query) {
      errors.push('Query is required');
    }

    // Business Rule: Query must be a string
    if (this.query && typeof this.query !== 'string') {
      errors.push('Query must be a string');
    }

    // Business Rule: Query cannot be empty
    if (this.query && this.query.trim().length === 0) {
      errors.push('Query cannot be empty');
    }

    // Business Rule: Query should have reasonable length
    if (this.query && this.query.length > 10000) {
      errors.push('Query is too long (maximum 10,000 characters)');
    }

    // Business Rule: Query should have minimum length
    if (this.query && this.query.trim().length < 3) {
      errors.push('Query is too short (minimum 3 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets the repository path
   * @returns {string}
   */
  getRepositoryPath() {
    return this.repositoryPath.trim();
  }

  /**
   * Gets the query
   * @returns {string}
   */
  getQuery() {
    return this.query.trim();
  }

  /**
   * Gets the configuration
   * @returns {Object}
   */
  getConfig() {
    return this.config;
  }

  /**
   * Gets metadata about the request
   * @returns {Object}
   */
  getMetadata() {
    return {
      repositoryPath: this.repositoryPath,
      queryLength: this.query ? this.query.length : 0,
      createdAt: this.createdAt.toISOString(),
      hasConfig: Object.keys(this.config).length > 0
    };
  }
}

module.exports = RepositoryAnalysis;
