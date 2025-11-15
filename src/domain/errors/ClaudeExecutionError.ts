import { DomainError } from './DomainError';

/**
 * Claude Execution Error
 * Thrown when Claude CLI execution fails
 */
export class ClaudeExecutionError extends DomainError {
  originalError: any;
  executionDetails: any;

  constructor(message: string, originalError: any = null, executionDetails: any = {}) {
    super(message, 'CLAUDE_EXECUTION_ERROR');
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
