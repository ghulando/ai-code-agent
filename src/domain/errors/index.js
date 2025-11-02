/**
 * Domain Errors Export
 * Central export for all domain errors
 */
const DomainError = require('./DomainError');
const ValidationError = require('./ValidationError');
const CodexExecutionError = require('./CodexExecutionError');
const PathAccessError = require('./PathAccessError');

module.exports = {
  DomainError,
  ValidationError,
  CodexExecutionError,
  PathAccessError
};
