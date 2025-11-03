import { Injectable } from '@nestjs/common';

/**
 * Check Health Service
 * Provides health check information for the service
 */
@Injectable()
export class CheckHealthService {
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Execute the service
   * @returns Health status information
   */
  execute() {
    const now = new Date();
    const uptime = Math.floor((now.getTime() - this.startTime.getTime()) / 1000); // seconds

    return {
      status: 'healthy',
      timestamp: now.toISOString(),
      service: 'code-agent',
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime),
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Format uptime in human-readable format
   * @param seconds - Uptime in seconds
   * @returns string
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
