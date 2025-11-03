import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckHealthService } from '../../application/services/check-health.service';

@Controller()
export class HealthController {
  constructor(private readonly checkHealthService: CheckHealthService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    const result = this.checkHealthService.execute();
    return {
      success: true,
      data: result,
    };
  }
}
