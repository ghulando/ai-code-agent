import { DomainError } from './DomainError';

/**
 * Validation Error
 * Thrown when entity validation fails
 */
export class ValidationError extends DomainError {
  errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }

  static fromValidationResult(validationResult: any) {
    if (validationResult.isValid) {
      throw new Error('Cannot create ValidationError from valid result');
    }

    return new ValidationError('Validation failed', validationResult.errors);
  }
}
