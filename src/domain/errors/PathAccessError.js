const DomainError = require('./DomainError');

/**
 * Path Access Error
 * Thrown when path validation or access fails
 */
class PathAccessError extends DomainError {
  constructor(message, path = null, reason = null) {
    super(message, 'PATH_ACCESS_ERROR');
    this.path = path;
    this.reason = reason;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      path: this.path,
      reason: this.reason
    };
  }
}

module.exports = PathAccessError;
