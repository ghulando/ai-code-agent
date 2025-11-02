/**
 * Server Entry Point - Clean Architecture
 * Minimal server setup that delegates to layers
 */
const express = require('express');
const config = require('./config');
const createContainer = require('./container');
const { setupMiddlewares, setupErrorHandling } = require('./presentation/http/middlewares');
const createRoutes = require('./presentation/http/routes');

// Create Express app
const app = express();
const PORT = config.server.port;

// Setup middlewares (security, cors, rate limiting, body parsing)
setupMiddlewares(app);

// Create dependency injection container
const container = createContainer();

// Setup routes with injected controllers
const routes = createRoutes(container.controllers);
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Setup error handling middleware (must be last)
setupErrorHandling(app);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Code Agent Server Started');
  console.log(`   Environment: ${config.server.nodeEnv}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Model: ${config.model.default}`);
  console.log('\n📍 Endpoints:');
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   Generate: http://localhost:${PORT}/generate`);
  console.log(`   Analyze:  http://localhost:${PORT}/analyze-repo`);
  console.log('\n✅ Ready to accept requests\n');
});

module.exports = app;

module.exports = app;
