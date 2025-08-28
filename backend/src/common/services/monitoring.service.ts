import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as os from 'os';
import * as process from 'process';

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    loadAverage: number[];
    usage: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    processRss: number;
    processHeapUsed: number;
    processHeapTotal: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    connections: number;
  };
  process: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    pid: number;
    version: string;
    platform: string;
    arch: string;
  };
}

export interface ApplicationMetrics {
  timestamp: string;
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    operations: number;
    slowQueries: number;
  };
  errors: {
    count: number;
    types: Record<string, number>;
    lastError: string;
  };
  performance: {
    memoryLeaks: boolean;
    gcDuration: number;
    eventLoopDelay: number;
  };
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private metrics: SystemMetrics[] = [];
  private requestCount = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private responseTimes: number[] = [];
  private errorCount = 0;
  private errorTypes: Record<string, number> = {};

  constructor() {
    this.logger.log('📊 Monitoring service initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async collectSystemMetrics() {
    try {
      const metrics = await this.getSystemMetrics();
      this.metrics.push(metrics);
      
      // Keep only last 60 metrics (1 hour of data)
      if (this.metrics.length > 60) {
        this.metrics = this.metrics.slice(-60);
      }

      // Log if system is under stress
      if (metrics.memory.usagePercent > 80) {
        this.logger.warn(`⚠️ High memory usage: ${metrics.memory.usagePercent.toFixed(2)}%`);
      }
      
      if (metrics.cpu.loadAverage[0] > os.cpus().length * 0.8) {
        this.logger.warn(`⚠️ High CPU load: ${metrics.cpu.loadAverage[0].toFixed(2)}`);
      }

      this.logger.debug(`📊 System metrics collected: CPU ${metrics.cpu.usage.toFixed(2)}%, Memory ${metrics.memory.usagePercent.toFixed(2)}%`);
    } catch (error) {
      this.logger.error('❌ Failed to collect system metrics:', error.message);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async generateReport() {
    try {
      const report = await this.generateMetricsReport();
      this.logger.log(`📋 Monitoring Report: ${report.summary}`);
      
      // In production, you might want to send this to a monitoring service
      // await this.sendToMonitoringService(report);
    } catch (error) {
      this.logger.error('❌ Failed to generate monitoring report:', error.message);
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        loadAverage: os.loadavg(),
        usage: this.calculateCpuUsage(),
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: (usedMem / totalMem) * 100,
        processRss: memUsage.rss,
        processHeapUsed: memUsage.heapUsed,
        processHeapTotal: memUsage.heapTotal,
      },
      disk: {
        total: 0, // Would need additional implementation for disk metrics
        used: 0,
        free: 0,
        usagePercent: 0,
      },
      network: {
        bytesReceived: 0, // Would need additional implementation for network metrics
        bytesSent: 0,
        connections: 0,
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: memUsage,
        cpuUsage: process.cpuUsage(),
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  async getApplicationMetrics(): Promise<ApplicationMetrics> {
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;

    return {
      timestamp: new Date().toISOString(),
      requests: {
        total: this.requestCount,
        successful: this.successfulRequests,
        failed: this.failedRequests,
        averageResponseTime: avgResponseTime,
      },
      database: {
        connections: 0, // Would need MongoDB connection pool monitoring
        operations: 0,
        slowQueries: 0,
      },
      errors: {
        count: this.errorCount,
        types: { ...this.errorTypes },
        lastError: 'No errors recorded',
      },
      performance: {
        memoryLeaks: false, // Would need memory leak detection
        gcDuration: 0,
        eventLoopDelay: 0,
      },
    };
  }

  async generateMetricsReport(): Promise<any> {
    const systemMetrics = await this.getSystemMetrics();
    const appMetrics = await this.getApplicationMetrics();
    
    // Calculate trends
    const recentMetrics = this.metrics.slice(-10);
    const memoryTrend = this.calculateTrend(recentMetrics.map(m => m.memory.usagePercent));
    const cpuTrend = this.calculateTrend(recentMetrics.map(m => m.cpu.loadAverage[0]));

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(systemMetrics, appMetrics),
      system: systemMetrics,
      application: appMetrics,
      trends: {
        memory: memoryTrend,
        cpu: cpuTrend,
      },
      recommendations: this.generateRecommendations(systemMetrics, appMetrics),
    };

    return report;
  }

  // Public methods for other services to call
  recordRequest(success: boolean, responseTime: number) {
    this.requestCount++;
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
    
    this.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  recordError(errorType: string, errorMessage: string) {
    this.errorCount++;
    this.errorTypes[errorType] = (this.errorTypes[errorType] || 0) + 1;
    
    this.logger.error(`🚨 Error recorded: ${errorType} - ${errorMessage}`);
  }

  getMetricsHistory(): SystemMetrics[] {
    return [...this.metrics];
  }

  private calculateCpuUsage(): number {
    // This is a simplified CPU usage calculation
    // In production, you might want to use more sophisticated methods
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return ((totalTick - totalIdle) / totalTick) * 100;
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private generateSummary(system: SystemMetrics, app: ApplicationMetrics): string {
    const memoryStatus = system.memory.usagePercent > 80 ? '⚠️ High' : '✅ Normal';
    const cpuStatus = system.cpu.loadAverage[0] > os.cpus().length * 0.8 ? '⚠️ High' : '✅ Normal';
    const errorStatus = app.errors.count > 0 ? '⚠️ Errors detected' : '✅ No errors';
    
    return `System: Memory ${memoryStatus}, CPU ${cpuStatus}, Errors ${errorStatus}`;
  }

  private generateRecommendations(system: SystemMetrics, app: ApplicationMetrics): string[] {
    const recommendations: string[] = [];
    
    if (system.memory.usagePercent > 80) {
      recommendations.push('Consider increasing memory allocation or optimizing memory usage');
    }
    
    if (system.cpu.loadAverage[0] > os.cpus().length * 0.8) {
      recommendations.push('Consider scaling horizontally or optimizing CPU-intensive operations');
    }
    
    if (app.errors.count > 10) {
      recommendations.push('Investigate error patterns and implement error handling improvements');
    }
    
    if (app.requests.averageResponseTime > 1000) {
      recommendations.push('Optimize database queries and implement caching strategies');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is performing well, no immediate actions required');
    }
    
    return recommendations;
  }
}
