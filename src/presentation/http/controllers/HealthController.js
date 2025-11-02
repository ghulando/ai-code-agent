/**
 * Health Controller
 * Handles HTTP requests for health checks
 */
class HealthController {
  constructor(checkHealthUseCase) {
    if (!checkHealthUseCase) {
      throw new Error('CheckHealthUseCase is required');
    }
    this.checkHealthUseCase = checkHealthUseCase;
  }

  handle(req, res) {
    try {
      const healthStatus = this.checkHealthUseCase.execute();
      
      res.status(200).json(healthStatus);
    } catch (error) {
      console.error('Error in HealthController:', error.message);
      
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'code-agent',
        error: error.message
      });
    }
  }
}

module.exports = HealthController;
