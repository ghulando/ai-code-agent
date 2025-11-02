const express = require('express');

/**
 * Create routes for the application
 * @param {Object} controllers - Object containing all controllers
 * @returns {Router} Express router
 */
function createRoutes(controllers) {
  const router = express.Router();

  const {
    codeGenerationController,
    repositoryController,
    healthController
  } = controllers;

  // Health check endpoint
  router.get('/health', (req, res) => healthController.handle(req, res));

  // Code generation endpoint
  router.post('/generate', (req, res) => codeGenerationController.handle(req, res));

  // Repository analysis endpoint
  router.post('/analyze-repo', (req, res) => repositoryController.handle(req, res));

  return router;
}

module.exports = createRoutes;
