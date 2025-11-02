const DomainError = require('./DomainError');

/**
 * Codex Execution Error
 * Thrown when Codex CLI execution fails
 */
class CodexExecutionError extends DomainError {
  constructor(message, originalError = null, executionDetails = {}) {
    super(message, 'CODEX_EXECUTION_ERROR');
    this.originalError = originalError;
    this.executionDetails = executionDetails;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      executionDetails: this.executionDetails,
      originalError: this.originalError ? {
        message: this.originalError.message,
        code: this.originalError.code
      } : null
    };
  }
}

module.exports = CodexExecutionError;
