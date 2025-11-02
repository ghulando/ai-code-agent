/**
 * Global Error Handler Middleware
 * Catches any unhandled errors in the application
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  // Check if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
