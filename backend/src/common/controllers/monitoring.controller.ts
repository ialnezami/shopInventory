import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MonitoringService } from '../services/monitoring.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

@ApiTags('monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('metrics')
  @Roles('admin')
  @ApiOperation({ summary: 'Get current system and application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    const [systemMetrics, appMetrics] = await Promise.all([
      this.monitoringService.getSystemMetrics(),
      this.monitoringService.getApplicationMetrics(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      application: appMetrics,
    };
  }

  @Get('system')
  @Roles('admin')
  @ApiOperation({ summary: 'Get current system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  async getSystemMetrics() {
    return this.monitoringService.getSystemMetrics();
  }

  @Get('application')
  @Roles('admin')
  @ApiOperation({ summary: 'Get current application metrics' })
  @ApiResponse({ status: 200, description: 'Application metrics retrieved successfully' })
  async getApplicationMetrics() {
    return this.monitoringService.getApplicationMetrics();
  }

  @Get('report')
  @Roles('admin')
  @ApiOperation({ summary: 'Get comprehensive monitoring report' })
  @ApiResponse({ status: 200, description: 'Monitoring report generated successfully' })
  async getMonitoringReport() {
    return this.monitoringService.generateMetricsReport();
  }

  @Get('history')
  @Roles('admin')
  @ApiOperation({ summary: 'Get metrics history' })
  @ApiResponse({ status: 200, description: 'Metrics history retrieved successfully' })
  async getMetricsHistory() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.monitoringService.getMetricsHistory(),
      count: this.monitoringService.getMetricsHistory().length,
    };
  }

  @Get('status')
  @Roles('admin')
  @ApiOperation({ summary: 'Get monitoring service status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  async getStatus() {
    const systemMetrics = await this.monitoringService.getSystemMetrics();
    const appMetrics = await this.monitoringService.getApplicationMetrics();
    
    // Determine overall status
    let status = 'healthy';
    let issues: string[] = [];
    
    if (systemMetrics.memory.usagePercent > 80) {
      status = 'warning';
      issues.push(`High memory usage: ${systemMetrics.memory.usagePercent.toFixed(2)}%`);
    }
    
    if (systemMetrics.cpu.loadAverage[0] > require('os').cpus().length * 0.8) {
      status = 'warning';
      issues.push(`High CPU load: ${systemMetrics.cpu.loadAverage[0].toFixed(2)}`);
    }
    
    if (appMetrics.errors.count > 10) {
      status = 'warning';
      issues.push(`High error count: ${appMetrics.errors.count}`);
    }
    
    if (systemMetrics.memory.usagePercent > 90 || appMetrics.errors.count > 50) {
      status = 'critical';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      issues,
      summary: {
        memory: `${systemMetrics.memory.usagePercent.toFixed(2)}%`,
        cpu: `${systemMetrics.cpu.usage.toFixed(2)}%`,
        errors: appMetrics.errors.count,
        uptime: `${(systemMetrics.process.uptime / 3600).toFixed(2)} hours`,
      },
    };
  }
}
