import { DomainError } from './DomainError';

/**
 * Gemini Execution Error
 * Thrown when Gemini CLI execution fails
 */
export class GeminiExecutionError extends DomainError {
  originalError: any;
  executionDetails: any;

  constructor(message: string, originalError: any = null, executionDetails: any = {}) {
    super(message, 'GEMINI_EXECUTION_ERROR');
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
