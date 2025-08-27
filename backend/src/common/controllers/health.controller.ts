import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from '../services/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth(@Res() res: Response) {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      
      // Set appropriate HTTP status based on health
      const httpStatus = healthStatus.status === 'ok' 
        ? HttpStatus.OK 
        : healthStatus.status === 'warning' 
          ? HttpStatus.OK // Still OK but with warnings
          : HttpStatus.SERVICE_UNAVAILABLE;

      return res.status(httpStatus).json({
        ...healthStatus,
        message: this.getHealthMessage(healthStatus.status),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health status with metrics' })
  @ApiResponse({ status: 200, description: 'Detailed health status retrieved successfully' })
  async getDetailedHealth(@Res() res: Response) {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      const metrics = await this.healthService.getMetrics();
      
      const httpStatus = healthStatus.status === 'ok' 
        ? HttpStatus.OK 
        : healthStatus.status === 'warning' 
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      return res.status(httpStatus).json({
        ...metrics,
        message: this.getHealthMessage(healthStatus.status),
        detailed: true,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Detailed health check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if application is ready to serve requests' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async getReadiness(@Res() res: Response) {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      
      // For readiness, we only care about critical services
      const isReady = healthStatus.checks.database.status === 'ok' && 
                     healthStatus.checks.memory.status !== 'error';
      
      if (isReady) {
        return res.status(HttpStatus.OK).json({
          status: 'ready',
          message: 'Application is ready to serve requests',
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'not_ready',
          message: 'Application is not ready to serve requests',
          timestamp: new Date().toISOString(),
          issues: this.getReadinessIssues(healthStatus),
        });
      }
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not_ready',
        message: 'Readiness check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Check if application is alive (liveness probe)' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async getLiveness(@Res() res: Response) {
    try {
      // Liveness check is simple - just check if the process is running
      return res.status(HttpStatus.OK).json({
        status: 'alive',
        message: 'Application is alive and running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'dead',
        message: 'Application is not responding',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get application metrics for monitoring' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(@Res() res: Response) {
    try {
      const metrics = await this.healthService.getMetrics();
      
      return res.status(HttpStatus.OK).json({
        ...metrics,
        message: 'Application metrics retrieved successfully',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Failed to retrieve metrics',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private getHealthMessage(status: string): string {
    switch (status) {
      case 'ok':
        return 'All systems are operational';
      case 'warning':
        return 'Some systems have warnings but are operational';
      case 'error':
        return 'Some systems are experiencing issues';
      default:
        return 'Health status unknown';
    }
  }

  private getReadinessIssues(healthStatus: any): string[] {
    const issues: string[] = [];
    
    if (healthStatus.checks.database.status !== 'ok') {
      issues.push('Database is not ready');
    }
    
    if (healthStatus.checks.memory.status === 'error') {
      issues.push('Memory usage is critical');
    }
    
    if (healthStatus.checks.system.status !== 'ok') {
      issues.push('System is not healthy');
    }
    
    return issues;
  }
}
