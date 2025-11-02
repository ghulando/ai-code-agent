const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('./rateLimiter');
const errorHandler = require('./errorHandler');

/**
 * Setup all Express middlewares
 * @param {Express} app - Express application instance
 */
function setupMiddlewares(app) {
  // Security middlewares
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  app.use(rateLimiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Setup error handling middleware (should be called after routes)
 * @param {Express} app - Express application instance
 */
function setupErrorHandling(app) {
  app.use(errorHandler);
}

module.exports = {
  setupMiddlewares,
  setupErrorHandling
};
