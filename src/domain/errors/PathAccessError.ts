import { DomainError } from './DomainError';

/**
 * Path Access Error
 * Thrown when path validation or access fails
 */
export class PathAccessError extends DomainError {
  path: string | null;
  reason: string | null;

  constructor(message: string, path: string | null = null, reason: string | null = null) {
    super(message, 'PATH_ACCESS_ERROR');
    this.path = path;
    this.reason = reason;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      path: this.path,
      reason: this.reason,
    };
  }
}
