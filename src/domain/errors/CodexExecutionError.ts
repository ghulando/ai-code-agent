import { DomainError } from './DomainError';

/**
 * Codex Execution Error
 * Thrown when Codex CLI execution fails
 */
export class CodexExecutionError extends DomainError {
  originalError: any;
  executionDetails: any;

  constructor(message: string, originalError: any = null, executionDetails: any = {}) {
    super(message, 'CODEX_EXECUTION_ERROR');
    this.originalError = originalError;
    this.executionDetails = executionDetails;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      executionDetails: this.executionDetails,
      originalError: this.originalError
        ? {
            message: this.originalError.message,
            code: this.originalError.code,
          }
        : null,
    };
  }
}
