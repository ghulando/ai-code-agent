const DomainError = require('./DomainError');

/**
 * Validation Error
 * Thrown when entity validation fails
 */
class ValidationError extends DomainError {
  constructor(message, errors = []) {
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }

  static fromValidationResult(validationResult) {
    if (validationResult.isValid) {
      throw new Error('Cannot create ValidationError from valid result');
    }
    
    return new ValidationError(
      'Validation failed',
      validationResult.errors
    );
  }
}

module.exports = ValidationError;
