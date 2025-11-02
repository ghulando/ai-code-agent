const config = {
  model: {
    default: process.env.DEFAULT_MODEL || 'azure/gpt-5-mini',
    allowOverride: false
  },
  
  server: {
    port: process.env.PORT || 3002,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  codex: {
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 300000
  }
};

module.exports = config;
