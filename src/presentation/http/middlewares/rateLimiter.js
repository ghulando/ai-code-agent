const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Middleware
 * Limits the number of requests from a single IP
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
